import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, it } from "@effect/vitest";
import {
  EventId,
  MessageId,
  NodeId,
  ProviderDriverKind,
  ProviderInstanceId,
  ProviderThreadId,
  ProviderTurnId,
  RunAttemptId,
  RunId,
  ThreadId,
  type OrchestrationV2DomainEvent,
  type OrchestrationV2ProviderTurn,
  type OrchestrationV2StoredEvent,
  type TurnTokenUsage,
} from "@t3tools/contracts";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as SqlClient from "effect/sql/SqlClient";

import * as EventStore from "../orchestration-v2/EventStore.ts";
import * as Sqlite from "../persistence/Sqlite.ts";

const now = DateTime.makeUnsafe("2026-10-31T00:00:00.000Z");
const layerMemory = EventStore.layer.pipe(Layer.provideMerge(Sqlite.layerMemory));

function route(name: string, driver = "codex", ordinal = 1) {
  return {
    threadId: ThreadId.make("thread:replay-spike"),
    runId: RunId.make(`run:${name}`),
    attemptId: RunAttemptId.make(`attempt:${name}`),
    nodeId: NodeId.make(`node:${name}`),
    providerThreadId: ProviderThreadId.make(`provider-thread:${driver}`),
    providerTurnId: ProviderTurnId.make(`provider-turn:${name}`),
    providerInstanceId: ProviderInstanceId.make(driver),
    driver: ProviderDriverKind.make(driver),
    ordinal,
  };
}

function usage(inputTokens: number, usageStatus: "partial" | "complete" = "complete") {
  return {
    usageStatus,
    usageScope: "main_agent",
    hasSubagents: false,
    inputTokens,
    cachedInputTokens: 20,
    cacheCreationTokens: 10,
    outputTokens: 8,
    reasoningTokens: 2,
  } satisfies TurnTokenUsage;
}

function turnEvent(
  id: string,
  destination: ReturnType<typeof route>,
  snapshot?: TurnTokenUsage,
  overrides: Partial<OrchestrationV2ProviderTurn> = {},
): OrchestrationV2DomainEvent {
  return {
    id: EventId.make(id),
    type: "provider-turn.updated",
    threadId: destination.threadId,
    runId: destination.runId,
    driver: destination.driver,
    providerInstanceId: destination.providerInstanceId,
    occurredAt: now,
    payload: {
      id: destination.providerTurnId,
      providerThreadId: destination.providerThreadId,
      nodeId: destination.nodeId,
      runAttemptId: destination.attemptId,
      nativeTurnRef: {
        driver: destination.driver,
        nativeId: `native:${destination.providerTurnId}`,
        strength: destination.driver === "codex" ? "strong" : "weak",
      },
      ordinal: destination.ordinal,
      status: snapshot?.usageStatus === "complete" ? "completed" : "running",
      startedAt: now,
      completedAt: snapshot?.usageStatus === "complete" ? now : null,
      ...(snapshot === undefined ? {} : { turnTokenUsage: snapshot }),
      ...overrides,
    },
  };
}

function linkEvents(
  destination: ReturnType<typeof route>,
): ReadonlyArray<OrchestrationV2DomainEvent> {
  const base = {
    threadId: destination.threadId,
    runId: destination.runId,
    driver: destination.driver,
    providerInstanceId: destination.providerInstanceId,
    occurredAt: now,
  };
  return [
    {
      ...base,
      id: EventId.make(`event:run:${destination.runId}`),
      type: "run.created",
      payload: {
        id: destination.runId,
        threadId: destination.threadId,
        ordinal: destination.ordinal,
        providerInstanceId: destination.providerInstanceId,
        modelSelection: { instanceId: destination.providerInstanceId, model: "synthetic" },
        providerThreadId: destination.providerThreadId,
        userMessageId: MessageId.make(`message:${destination.runId}`),
        rootNodeId: destination.nodeId,
        activeAttemptId: destination.attemptId,
        status: "running",
        requestedAt: now,
        startedAt: now,
        completedAt: null,
        checkpointId: null,
        contextHandoffId: null,
      },
    },
    {
      ...base,
      id: EventId.make(`event:attempt:${destination.attemptId}`),
      type: "run-attempt.created",
      payload: {
        id: destination.attemptId,
        runId: destination.runId,
        attemptOrdinal: 1,
        rootNodeId: destination.nodeId,
        providerInstanceId: destination.providerInstanceId,
        providerThreadId: destination.providerThreadId,
        providerTurnId: null,
        reason: "initial",
        status: "running",
        startedAt: now,
        completedAt: null,
      },
    },
    {
      ...base,
      id: EventId.make(`event:provider-thread:${destination.runId}`),
      type: "provider-thread.updated",
      payload: {
        id: destination.providerThreadId,
        driver: destination.driver,
        providerInstanceId: destination.providerInstanceId,
        providerSessionId: null,
        appThreadId: destination.threadId,
        ownerNodeId: destination.nodeId,
        nativeThreadRef: {
          driver: destination.driver,
          nativeId: "native-thread",
          strength: "strong",
        },
        nativeConversationHeadRef: null,
        status: "active",
        firstRunOrdinal: 1,
        lastRunOrdinal: destination.ordinal,
        handoffIds: [],
        forkedFrom: null,
        pendingBackgroundTasks: [],
        contextUsage: null,
        nativeMetadata: null,
        goal: null,
        createdAt: now,
        updatedAt: now,
      },
    },
  ];
}

const setup = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE spike_ledger (
    thread_id TEXT NOT NULL, provider_thread_id TEXT NOT NULL, provider_turn_id TEXT NOT NULL,
    run_id TEXT, attempt_id TEXT, ordinal INTEGER NOT NULL,
    driver TEXT, provider_instance_id TEXT, native_ref_json TEXT,
    usage_json TEXT, usage_status TEXT NOT NULL, input_tokens INTEGER, output_tokens INTEGER,
    cache_read INTEGER, cache_write INTEGER, reasoning INTEGER,
    event_id TEXT NOT NULL, last_sequence INTEGER NOT NULL,
    PRIMARY KEY (thread_id, provider_thread_id, provider_turn_id)
  )`;
  yield* sql`CREATE TABLE spike_cursor (id INTEGER PRIMARY KEY CHECK (id = 1), sequence INTEGER NOT NULL)`;
  yield* sql`INSERT INTO spike_cursor VALUES (1, 0)`;
});

const readCursor = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const rows = yield* sql<{ sequence: number }>`SELECT sequence FROM spike_cursor WHERE id = 1`;
  return rows[0]!.sequence;
});

const readState = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const rows = yield* sql<{
    thread_id: string;
    provider_thread_id: string;
    provider_turn_id: string;
    run_id: string | null;
    attempt_id: string | null;
    ordinal: number;
    native_ref_json: string | null;
    usage_json: string | null;
    usage_status: string;
    input_tokens: number | null;
    last_sequence: number;
  }>`SELECT * FROM spike_ledger ORDER BY thread_id, provider_thread_id, provider_turn_id`;
  const totals = yield* sql<{
    turns: number;
    incomplete: number;
    unknown: number;
    known_input: number | null;
    known_output: number | null;
    cache_read: number | null;
    cache_write: number | null;
    reasoning: number | null;
  }>`SELECT COUNT(*) AS turns,
    SUM(usage_status <> 'complete') AS incomplete,
    SUM(usage_status = 'unavailable' OR input_tokens IS NULL OR output_tokens IS NULL
      OR cache_read IS NULL OR cache_write IS NULL) AS unknown,
    SUM(input_tokens) AS known_input, SUM(output_tokens) AS known_output,
    SUM(cache_read) AS cache_read, SUM(cache_write) AS cache_write, SUM(reasoning) AS reasoning
    FROM spike_ledger`;
  return { rows, totals: totals[0]!, cursor: yield* readCursor };
});

const apply = Effect.fn("ReplaySpike.apply")(function* (
  stored: OrchestrationV2StoredEvent,
  failAfterUpsert = false,
) {
  const sql = yield* SqlClient.SqlClient;
  const transaction = Effect.gen(function* () {
    if (stored.sequence <= (yield* readCursor)) return false;
    const event = stored.event;
    if (event.type === "provider-turn.updated") {
      const turn = event.payload;
      const snapshot = turn.turnTokenUsage;
      yield* sql`INSERT INTO spike_ledger ${sql.insert({
        thread_id: event.threadId,
        provider_thread_id: turn.providerThreadId,
        provider_turn_id: turn.id,
        run_id: event.runId ?? null,
        attempt_id: turn.runAttemptId,
        ordinal: turn.ordinal,
        driver: event.driver ?? null,
        provider_instance_id: event.providerInstanceId ?? null,
        native_ref_json: turn.nativeTurnRef === null ? null : JSON.stringify(turn.nativeTurnRef),
        usage_json: snapshot === undefined ? null : JSON.stringify(snapshot),
        usage_status: snapshot?.usageStatus ?? "unavailable",
        input_tokens: snapshot?.inputTokens ?? null,
        output_tokens: snapshot?.outputTokens ?? null,
        cache_read: snapshot?.cachedInputTokens ?? null,
        cache_write: snapshot?.cacheCreationTokens ?? null,
        reasoning: snapshot?.reasoningTokens ?? null,
        event_id: event.id,
        last_sequence: stored.sequence,
      })}
      ON CONFLICT (thread_id, provider_thread_id, provider_turn_id) DO UPDATE SET
        run_id = excluded.run_id, attempt_id = excluded.attempt_id, ordinal = excluded.ordinal,
        driver = excluded.driver, provider_instance_id = excluded.provider_instance_id,
        native_ref_json = excluded.native_ref_json, usage_json = excluded.usage_json,
        usage_status = excluded.usage_status, input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens, cache_read = excluded.cache_read,
        cache_write = excluded.cache_write, reasoning = excluded.reasoning,
        event_id = excluded.event_id, last_sequence = excluded.last_sequence`;
      if (failAfterUpsert) return yield* Effect.fail("injected-between-upsert-and-cursor" as const);
    }
    yield* sql`UPDATE spike_cursor SET sequence = ${stored.sequence} WHERE id = 1`;
    return true;
  });
  return yield* sql.withTransaction(transaction);
});

const append = Effect.fn("ReplaySpike.append")(function* (
  events: ReadonlyArray<OrchestrationV2DomainEvent>,
) {
  const store = yield* EventStore.EventStoreV2;
  const sql = yield* SqlClient.SqlClient;
  return yield* sql.withTransaction(store.append({ events }));
});

const replay = Effect.gen(function* () {
  const store = yield* EventStore.EventStoreV2;
  const afterSequence = yield* readCursor;
  const throughSequence = yield* store.latestSequence();
  yield* store
    .read({ afterSequence, throughSequence })
    .pipe(Stream.runForEach((event) => apply(event)));
});

const assertRebuild = Effect.gen(function* () {
  const live = yield* readState;
  const sql = yield* SqlClient.SqlClient;
  yield* sql.withTransaction(
    Effect.gen(function* () {
      yield* sql`DELETE FROM spike_ledger`;
      yield* sql`UPDATE spike_cursor SET sequence = 0 WHERE id = 1`;
    }),
  );
  yield* replay;
  assert.deepEqual(yield* readState, live);
});

it.effect(
  "replaces cumulative snapshots, completes partial usage and accepts downward late corrections",
  () =>
    Effect.gen(function* () {
      yield* setup;
      const destination = route("cumulative");
      const events = yield* append([
        ...linkEvents(destination),
        turnEvent("event:partial", destination, usage(100, "partial")),
        turnEvent("event:complete", destination, usage(150)),
        turnEvent("event:duplicate-payload", destination, usage(150)),
        turnEvent("event:late-correction", destination, usage(120)),
      ]);
      yield* Effect.forEach(events.slice(0, 4), (event) => apply(event));
      assert.equal((yield* readState).totals.incomplete, 1);
      yield* apply(events[4]!);
      const complete = yield* readState;
      assert.equal(complete.totals.incomplete, 0);
      assert.equal(complete.totals.known_input, 150);
      yield* apply(events[5]!);
      assert.deepEqual((yield* readState).totals, complete.totals);
      assert.isFalse(yield* apply(events[5]!));
      yield* apply(events[6]!);
      assert.isFalse(yield* apply(events[4]!));
      const corrected = yield* readState;
      assert.deepEqual(corrected.totals, {
        turns: 1,
        incomplete: 0,
        unknown: 0,
        known_input: 120,
        known_output: 8,
        cache_read: 20,
        cache_write: 10,
        reasoning: 2,
      });
      assert.equal(corrected.rows[0]!.run_id, destination.runId);
      assert.equal(corrected.rows[0]!.attempt_id, destination.attemptId);
      yield* assertRebuild;
    }).pipe(Effect.provide(Layer.fresh(layerMemory))),
);

it.effect(
  "keeps stored turn identity through weak-ref changes, missing refs and native-id discovery",
  () =>
    Effect.gen(function* () {
      yield* setup;
      const weak = route("weak", "claudeAgent");
      const strong = route("strong");
      const otherAttempt = route("weak-next", "claudeAgent");
      const otherNativeThread = {
        ...strong,
        providerThreadId: ProviderThreadId.make("provider-thread:second-native-session"),
      };
      yield* append([
        turnEvent("event:weak-start", weak, usage(100, "partial")),
        turnEvent("event:weak-streaming-strong-ref", weak, usage(105, "partial"), {
          nativeTurnRef: { driver: weak.driver, nativeId: "streaming-message", strength: "strong" },
        }),
        turnEvent("event:weak-cursor-changes", weak, usage(110), {
          nativeTurnRef: {
            driver: weak.driver,
            nativeId: "later-message-cursor",
            strength: "weak",
          },
        }),
        turnEvent("event:strong-start", strong, undefined, { nativeTurnRef: null }),
        turnEvent("event:strong-discovered", strong, usage(120)),
        turnEvent("event:weak-same-ordinal", otherAttempt, usage(130), { nativeTurnRef: null }),
        turnEvent("event:strong-same-native-id-other-thread", otherNativeThread, usage(140)),
      ]);
      yield* replay;
      const state = yield* readState;
      assert.equal(state.totals.turns, 4);
      assert.equal(state.totals.known_input, 500);
      assert.deepEqual(
        state.rows.map((row) => row.ordinal),
        [1, 1, 1, 1],
      );
      assert.equal(state.rows.filter((row) => row.native_ref_json === null).length, 1);
      assert.equal(
        state.rows.find((row) => row.provider_turn_id === weak.providerTurnId)!.input_tokens,
        110,
      );
      yield* assertRebuild;
    }).pipe(Effect.provide(Layer.fresh(layerMemory))),
);

it.effect(
  "preserves missing ACP usage and missing cache buckets separately from measured zero",
  () =>
    Effect.gen(function* () {
      yield* setup;
      const acp = route("acp", "antigravity");
      const context = linkEvents(acp)[2]!;
      assert.equal(context.type, "provider-thread.updated");
      if (context.type !== "provider-thread.updated") return;
      yield* append([
        {
          ...context,
          payload: {
            ...context.payload,
            contextUsage: {
              usedTokens: 14090,
              maxTokens: 1048576,
            },
          },
        },
        turnEvent("event:acp-complete-no-usage", acp, undefined, {
          status: "completed",
          completedAt: now,
        }),
        turnEvent("event:measured-zero", route("zero"), {
          ...usage(0),
          cachedInputTokens: 0,
          cacheCreationTokens: 0,
          outputTokens: 0,
          reasoningTokens: 0,
        }),
        turnEvent("event:missing-cache", route("missing-cache"), {
          usageStatus: "complete",
          usageScope: "main_agent",
          hasSubagents: false,
          inputTokens: 100,
          outputTokens: 8,
        }),
        turnEvent("event:explicit-unavailable", route("unavailable"), {
          usageStatus: "unavailable",
          usageScope: "main_agent",
          hasSubagents: false,
        }),
      ]);
      yield* replay;
      const state = yield* readState;
      assert.equal(state.totals.turns, 4);
      assert.equal(state.totals.unknown, 3);
      assert.equal(
        state.rows.find((row) => row.provider_turn_id === acp.providerTurnId)!.input_tokens,
        null,
      );
      assert.equal(
        state.rows.find(
          (row) => row.provider_turn_id === ProviderTurnId.make("provider-turn:zero"),
        )!.input_tokens,
        0,
      );
      assert.equal(state.totals.known_input, 100);
      yield* assertRebuild;
    }).pipe(Effect.provide(Layer.fresh(layerMemory))),
);

it.effect.each(["claudeAgent", "codex"])(
  "reopens persisted SQLite mid-turn on %s and rolls back row and cursor together",
  (driver) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const directory = yield* fs.makeTempDirectoryScoped({ prefix: "t3-replay-spike-" });
      const dbPath = `${directory}/statev2.sqlite`;
      const open = EventStore.layer.pipe(Layer.provideMerge(Sqlite.layerFromPath(dbPath)));
      const destination = route("restart", driver);
      const before = yield* Effect.gen(function* () {
        yield* setup;
        yield* append([
          ...linkEvents(destination),
          turnEvent("event:before-restart", destination, usage(100, "partial")),
        ]);
        yield* replay;
        return yield* readState;
      }).pipe(Effect.provide(Layer.fresh(open)));

      const committed = yield* Effect.gen(function* () {
        assert.deepEqual(yield* readState, before);
        const store = yield* EventStore.EventStoreV2;
        const persisted = yield* store.read().pipe(Stream.runCollect);
        assert.lengthOf(persisted, 4);
        const attempt = persisted.find(
          (stored) => stored.event.type === "run-attempt.created",
        )!.event;
        assert.equal(attempt.type, "run-attempt.created");
        if (attempt.type !== "run-attempt.created") return yield* Effect.die("Expected attempt");
        assert.equal(attempt.payload.runId, before.rows[0]!.run_id);
        assert.equal(attempt.payload.id, before.rows[0]!.attempt_id);
        assert.isNull(attempt.payload.providerTurnId);
        const run = persisted.find((stored) => stored.event.type === "run.created")!.event;
        if (run.type !== "run.created") return yield* Effect.die("Expected run");
        assert.equal(run.payload.threadId, destination.threadId);
        assert.equal(run.payload.id, before.rows[0]!.run_id);
        const providerThread = persisted.find(
          (stored) => stored.event.type === "provider-thread.updated",
        )!.event;
        if (providerThread.type !== "provider-thread.updated")
          return yield* Effect.die("Expected provider thread");
        assert.equal(providerThread.payload.appThreadId, destination.threadId);
        assert.equal(providerThread.payload.id, before.rows[0]!.provider_thread_id);
        const [next] = yield* append([turnEvent("event:after-restart", destination, usage(150))]);
        assert.equal(
          yield* apply(next!, true).pipe(Effect.flip),
          "injected-between-upsert-and-cursor",
        );
        assert.deepEqual(yield* readState, before);
        return next!;
      }).pipe(Effect.provide(Layer.fresh(open)));

      yield* Effect.gen(function* () {
        assert.deepEqual(yield* readState, before);
        yield* replay;
        const live = yield* readState;
        assert.equal(live.cursor, committed.sequence);
        assert.equal(live.rows.length, 1);
        assert.equal(live.rows[0]!.input_tokens, 150);
        assert.equal(live.totals.incomplete, 0);
        assert.isFalse(yield* apply(committed));
        assert.deepEqual(yield* readState, live);
        yield* assertRebuild;
      }).pipe(Effect.provide(Layer.fresh(open)));
    }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
);
