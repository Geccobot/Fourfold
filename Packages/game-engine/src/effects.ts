
import { CARD_REGISTRY } from "./cards";

import type {
  Creature,
  GameState,
  Module,
  PendingAction,
  PlayerId,
  QueuedEffect,
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

      switch (action.type) {
        case "reduce-score": {
          if (!target) break;
          if (target.module.owner === queued.player) {
            break;
          }
          if (target.module.protectedFromReduction) {
            break;
          }

          const score =
            target.creature.currentScore ??
            target.creature.baseScore;

          target.creature.currentScore = Math.max(
            0,
            score - action.amount
          );
          break;
        }

        case "reveal-creature": {
          if (!target) break;
          if (target.module.owner === queued.player) {
            break;
          }

          target.creature.revealed = true;
          break;
        }

        case "move-creature": {
          if (!target) break;
          if (target.module.owner !== queued.player) {
            break;
          }

          const destination = next.modules.find(
            (module) =>
              module.id ===
              queued.targets.destinationModuleId
          );

          if (!destination) break;
          if (destination.owner !== queued.player) {
            break;
          }
          if (destination.id === target.module.id) {
            break;
          }

          target.module.creatures =
            target.module.creatures.filter(
              (creature) =>
                creature.id !== target.creature.id
            );

          destination.creatures.push(target.creature);
          break;
        }

        case "protect-module": {
          source.module.protectedFromReduction = true;
          break;
        }
      }
    }
  }

  return next;
}
