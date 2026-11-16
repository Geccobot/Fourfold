
import { CARD_REGISTRY } from "./cards";

import type {
  Creature,
  GameState,
  Module,
  PendingAction,
  QueuedEffect,
  ResolutionEvent,
} from "./types";

const TIMING_ORDER = {
  priority: 0,
  normal: 1,
  delayed: 2,
};

function cloneState(state: GameState): GameState {
  return {
    ...state,
    modules: state.modules.map((module) => ({
      ...module,
      creatures: module.creatures.map((creature) => ({
        ...creature,
      })),
    })),
    pendingActions: state.pendingActions.map((action) => ({
      ...action,
      targets: action.targets
        ? { ...action.targets }
        : undefined,
    })),
    lastTurnEvents: state.lastTurnEvents.map((event) => ({
      ...event,
    })),
  };
}

function findCreature(
  state: GameState,
  creatureId: string
): { creature: Creature; module: Module } | null {
  for (const module of state.modules) {
    const creature = module.creatures.find(
      (item) => item.id === creatureId
    );

    if (creature) {
      return { creature, module };
    }
  }

  return null;
}

export function collectEffects(
  state: GameState
): QueuedEffect[] {
  const queue: QueuedEffect[] = [];

  state.pendingActions.forEach(
    (action: PendingAction, playOrder: number) => {
      if (
        action.type !== "place-creature" ||
        !action.cardId
      ) {
        return;
      }

      const placed = findCreature(
        state,
        action.cardId
      );

      if (!placed?.creature.cardId) {
        return;
      }

      const definition =
        CARD_REGISTRY[placed.creature.cardId];

      if (!definition) {
        return;
      }

      definition.effects.forEach(
        (effect, effectIndex) => {
          if (effect.trigger !== "onReveal") {
            return;
          }

          queue.push({
            sourceCreatureId: action.cardId!,
            player: action.player,
            playOrder,
            effectIndex,
            timing: effect.timing ?? "normal",
            effect,
            targets: { ...action.targets },
          });
        }
      );
    }
  );

  return queue.sort(
    (a, b) =>
      TIMING_ORDER[a.timing] -
        TIMING_ORDER[b.timing] ||
      a.playOrder - b.playOrder ||
      a.effectIndex - b.effectIndex
  );
}

export function resolveEffects(
  state: GameState
): GameState {
  const next = cloneState(state);
  const queue = collectEffects(next);

  function log(
    event: Omit<ResolutionEvent, "turn">
  ): void {
    next.lastTurnEvents.push({
      turn: next.turn,
      ...event,
    });
  }

  for (const queued of queue) {
    const source = findCreature(
      next,
      queued.sourceCreatureId
    );

    if (!source) {
      continue;
    }

    for (const action of queued.effect.actions) {
      const targetId =
        queued.targets.targetCreatureId;

      const target = targetId
        ? findCreature(next, targetId)
        : null;

      const baseEvent = {
        sourceCreatureId: source.creature.id,
        targetCreatureId: targetId,
        timing: queued.timing,
      };

      switch (action.type) {
        case "reduce-score": {
          if (
            !target ||
            target.module.owner === queued.player
          ) {
            log({
              ...baseEvent,
              type: "effect-fizzled",
              message:
                `${source.creature.name}'s score reduction ` +
                "had no valid enemy target.",
            });
            break;
          }

          if (target.module.protectedFromReduction) {
            log({
              ...baseEvent,
              type: "score-reduction-blocked",
              moduleId: target.module.id,
              message:
                `${target.creature.name} was protected ` +
                `from ${source.creature.name}'s ` +
                "score reduction.",
            });
            break;
          }

          const previousScore =
            target.creature.currentScore ??
            target.creature.baseScore;

          const newScore = Math.max(
            0,
            previousScore - action.amount
          );

          target.creature.currentScore = newScore;

          log({
            ...baseEvent,
            type: "score-reduced",
            moduleId: target.module.id,
            previousScore,
            newScore,
            message:
              `${source.creature.name} reduced ` +
              `${target.creature.name}'s score ` +
              `from ${previousScore} to ${newScore}.`,
          });
          break;
        }

        case "reveal-creature": {
          if (
            !target ||
            target.module.owner === queued.player
          ) {
            log({
              ...baseEvent,
              type: "effect-fizzled",
              message:
                `${source.creature.name}'s reveal ` +
                "had no valid enemy target.",
            });
            break;
          }

          if (target.creature.revealed) {
            log({
              ...baseEvent,
              type: "effect-fizzled",
              message:
                `${target.creature.name} was already revealed.`,
            });
            break;
          }

          target.creature.revealed = true;

          log({
            ...baseEvent,
            type: "creature-revealed",
            moduleId: target.module.id,
            message:
              `${source.creature.name} revealed ` +
              `${target.creature.name}.`,
          });
          break;
        }

        case "move-creature": {
          const destination = next.modules.find(
            (module) =>
              module.id ===
              queued.targets.destinationModuleId
          );

          if (
            !target ||
            target.module.owner !== queued.player ||
            !destination ||
            destination.owner !== queued.player ||
            destination.id === target.module.id
          ) {
            log({
              ...baseEvent,
              type: "effect-fizzled",
              message:
                `${source.creature.name}'s movement ` +
                "had no valid destination or target.",
            });
            break;
          }

          const fromModuleId = target.module.id;
          const toModuleId = destination.id;

          target.module.creatures =
            target.module.creatures.filter(
              (creature) =>
                creature.id !== target.creature.id
            );

          destination.creatures.push(target.creature);

          log({
            ...baseEvent,
            type: "creature-moved",
            fromModuleId,
            toModuleId,
            message:
              `${source.creature.name} moved ` +
              `${target.creature.name} from ` +
              `Module ${fromModuleId + 1} to ` +
              `Module ${toModuleId + 1}.`,
          });
          break;
        }

        case "protect-module": {
          source.module.protectedFromReduction = true;

          log({
            ...baseEvent,
            type: "module-protected",
            moduleId: source.module.id,
            message:
              `${source.creature.name} protected ` +
              `Module ${source.module.id + 1} ` +
              "from score reduction.",
          });
          break;
        }
      }
    }
  }

  return next;
}
