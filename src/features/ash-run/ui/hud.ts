import { formatFolioTime } from "@/lib/format-folio-time";
import {
  UNSTABLE_MOTION_VX_MIN,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../core/constants";
import { LAB_SENTINEL_MAX_HP } from "../entities/enemy";
import type { GameState } from "../core/types";

function unstableCanFire(ash: GameState["ash"]): boolean {
  return (
    !ash.grounded ||
    Math.abs(ash.vx) >= UNSTABLE_MOTION_VX_MIN ||
    ash.dashRemainingMs > 0
  );
}

function channelLabel(ch: 0 | 1 | 2): string {
  return ch === 0 ? "BIO" : ch === 1 ? "MECHA" : "PURE";
}

function minibossHudTitle(id: string): string {
  if (id === "vault_warden") return "Warden";
  if (id === "fracture_herald") return "Herald";
  if (id === "reckoning_arbiter") return "Arbiter";
  if (id === "closure_magistrate") return "Magistrate";
  if (id === "exile_gatekeeper") return "Gatekeeper";
  if (id === "horizon_sovereign") return "Sovereign";
  if (id === "echo_custodian") return "Custodian";
  if (id === "verge_harbinger") return "Harbinger";
  if (id === "zenith_exarch") return "Exarch";
  if (id === "terminus_adjudicator") return "Adjudicator";
  if (id === "coda_curator") return "Curator";
  if (id === "afterword_scribe") return "Scribe";
  if (id === "postscript_archivist") return "Archivist";
  if (id === "index_steward") return "Steward";
  if (id === "appendix_binder") return "Binder";
  if (id === "colophon_compositor") return "Compositor";
  if (id === "epilogue_witness") return "Witness";
  if (id === "codex_chronicler") return "Chronicler";
  if (id === "afterline_notary") return "Notary";
  if (id === "vellum_illuminator") return "Illuminator";
  if (id === "endpaper_conservator") return "Conservator";
  if (id === "flyleaf_prefacer") return "Prefacer";
  if (id === "halftitle_titler") return "Titler";
  if (id === "frontispiece_engraver") return "Engraver";
  if (id === "titlepage_imprinter") return "Imprinter";
  if (id === "copyright_registrar") return "Registrar";
  if (id === "dedication_patron") return "Patron";
  if (id === "epigraph_citer") return "Citer";
  if (id === "foreword_interlocutor") return "Interlocutor";
  if (id === "preface_scrivener") return "Scrivener";
  if (id === "introduction_usher") return "Usher";
  if (id === "body_galleyman") return "Galleyman";
  if (id === "incipit_rubricator") return "Rubricator";
  if (id === "chapter_pager") return "Pager";
  if (id === "interlude_intervenor") return "Intervenor";
  return "Sentinel";
}

export type HudDrawOptions = {
  /** Stored PB (ms) for this stage when the run started; pace hint only, not a replay ghost. */
  personalBestMs?: number | null;
};

export function drawHud(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  nowMs: number,
  winHud?: { newRecord?: boolean } | null,
  hudOptions?: HudDrawOptions | null,
): void {
  const { ash, beat, phase } = state;

  if (phase !== "won") {
    const sentinel = state.enemies.find((e) => e.isMiniboss && e.hp > 0);

    ctx.textAlign = "right";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillStyle = "rgba(245, 237, 216, 0.78)";
    ctx.fillText(
      formatFolioTime(state.runElapsedMs ?? 0),
      VIEW_WIDTH - 16,
      14,
    );

    const pb = hudOptions?.personalBestMs;
    const showPbPace = pb != null && Number.isFinite(pb) && pb > 0;
    if (showPbPace) {
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = "rgba(245, 237, 216, 0.42)";
      ctx.fillText(`PB ${formatFolioTime(pb)}`, VIEW_WIDTH - 16, 28);
      const el = state.runElapsedMs ?? 0;
      const delta = el - pb;
      if (el > 250) {
        const tieBandMs = 80;
        if (Math.abs(delta) < tieBandMs) {
          ctx.fillStyle = "rgba(200, 200, 210, 0.55)";
          ctx.fillText("vs PB · even", VIEW_WIDTH - 16, 41);
        } else if (delta <= 0) {
          ctx.fillStyle = "rgba(125, 211, 168, 0.85)";
          ctx.fillText(`vs PB · −${formatFolioTime(-delta)}`, VIEW_WIDTH - 16, 41);
        } else {
          ctx.fillStyle = "rgba(251, 191, 36, 0.82)";
          ctx.fillText(`vs PB · +${formatFolioTime(delta)}`, VIEW_WIDTH - 16, 41);
        }
      }
    }
    ctx.textAlign = "left";

    if (sentinel) {
      ctx.textAlign = "center";
      ctx.font = "11px system-ui, sans-serif";
      const hit = sentinel.hurtCooldownMs > 0;
      if (hit) {
        ctx.globalAlpha = 0.72 + 0.28 * Math.sin(nowMs * 0.014);
      }
      ctx.fillStyle = hit ? "#e8e0ff" : "#c4b8e8";
      ctx.fillText(
        `${minibossHudTitle(sentinel.id)}  ${sentinel.hp} / ${LAB_SENTINEL_MAX_HP}`,
        VIEW_WIDTH / 2,
        20,
      );
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "#e8e8ec";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "left";
    let hx = 16;
    const hy = sentinel ? 52 : 40;
    const unstableY = hy + 10;
    const ceilHp = Math.ceil(ash.hp);
    const lastHeart = ceilHp === 1;
    for (let i = 0; i < ash.maxHp; i++) {
      const filled = i < ceilHp;
      if (filled && lastHeart) {
        ctx.globalAlpha = 0.86 + 0.14 * Math.sin(nowMs * 0.0048);
        ctx.fillStyle = "#ff6b4a";
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = filled ? "#5dade2" : "#2a3540";
      }
      ctx.fillText("♥", hx, hy);
      hx += 22;
    }
    ctx.globalAlpha = 1;

    /* Right column: mobility + strike cooldowns (only when ticking) */
    ctx.textAlign = "right";
    ctx.font = "11px system-ui, sans-serif";
    let ry = showPbPace ? 52 : 26;
    if (ash.dashRemainingMs > 0) {
      ctx.fillStyle = "#8cb4ff";
      ctx.fillText("dash · burst", VIEW_WIDTH - 16, ry);
      ry += 16;
    } else if (ash.dashCooldownMs > 0) {
      ctx.fillStyle = "#5c6570";
      ctx.fillText(
        `dash ${(ash.dashCooldownMs / 1000).toFixed(1)}s`,
        VIEW_WIDTH - 16,
        ry,
      );
      ry += 16;
    }
    if (ash.hitbox.active) {
      ctx.fillStyle = "#c9a090";
      ctx.fillText("strike · active", VIEW_WIDTH - 16, ry);
      ry += 16;
    } else if (ash.attackCooldownMs > 0) {
      ctx.fillStyle = "#6a5a58";
      ctx.fillText(
        `strike ${(ash.attackCooldownMs / 1000).toFixed(2)}s`,
        VIEW_WIDTH - 16,
        ry,
      );
    }
    ctx.textAlign = "left";

    ctx.fillStyle = "#889";
    ctx.font = "12px system-ui";
    const unstableHud =
      ash.unstableCooldownMs > 0
        ? `${(ash.unstableCooldownMs / 1000).toFixed(1)}s`
        : unstableCanFire(ash)
          ? "ready"
          : "move first";
    const nextCh = channelLabel(ash.unstableNextChannel);
    ctx.fillText(`Unstable [K]: ${unstableHud} · next ${nextCh}`, 16, unstableY);

    const readY = hy + 26;
    let fusionLineY = readY + 16;
    {
      let readHud: string;
      if (ash.perceptionRemainingMs > 0) {
        readHud = `reading ${(ash.perceptionRemainingMs / 1000).toFixed(1)}s`;
      } else if (ash.perceptionCooldownRemainingMs > 0) {
        readHud = `cd ${(ash.perceptionCooldownRemainingMs / 1000).toFixed(1)}s`;
      } else {
        readHud = "ready";
      }
      ctx.fillStyle =
        ash.perceptionRemainingMs > 0
          ? "#9df"
          : ash.perceptionCooldownRemainingMs > 0
            ? "#778"
            : "#b8d8ec";
      ctx.font = "12px system-ui";
      ctx.fillText(`Read [E]: ${readHud}`, 16, readY);
      if (ash.perceptionRemainingMs > 0) {
        ctx.font = "10px system-ui, sans-serif";
        ctx.fillStyle = "rgba(155, 215, 235, 0.88)";
        ctx.fillText("traces · hazards · routes", 16, readY + 14);
        fusionLineY = readY + 30;
      }
    }

    const surgeRow =
      ash.fusionMoveMs > 0 &&
      ash.fusionMoveChannel !== null &&
      ash.fusionPureSenseMs <= 0;

    if (ash.fusionPureSenseMs > 0) {
      ctx.fillStyle = "#aee";
      ctx.font = "12px system-ui";
      ctx.fillText("PURE — route sense (slow)", 16, fusionLineY);
    } else if (surgeRow) {
      ctx.fillStyle =
        ash.fusionMoveChannel === 0 ? "#d8b8a8" : "#9ec8e8";
      ctx.font = "12px system-ui";
      ctx.fillText(
        ash.fusionMoveChannel === 0
          ? "BIO surge · sticky speed"
          : "MECHA surge · sharp dash",
        16,
        fusionLineY,
      );
    }

    const hasFusionRow = ash.fusionPureSenseMs > 0 || surgeRow;
    const channelY = hasFusionRow ? fusionLineY + 20 : readY + 20;

    const ch =
      ash.unstableChannel === 0
        ? "BIO"
        : ash.unstableChannel === 1
          ? "MECHA"
          : ash.unstableChannel === 2
            ? "PURE"
            : "";
    if (ch && ash.unstableFlashMs > 0) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px system-ui";
      ctx.fillText(`Channel: ${ch}`, 16, channelY);
    }

    if (beat) {
      const barH = beat.text.includes("\n") ? 118 : 100;
      ctx.fillStyle = "rgba(28, 22, 16, 0.82)";
      ctx.fillRect(0, VIEW_HEIGHT - barH, VIEW_WIDTH, barH);
      ctx.fillStyle = "#f5edd8";
      ctx.font = 'italic 15px Georgia, "Times New Roman", serif';
      const maxW = VIEW_WIDTH - 48;
      let y = VIEW_HEIGHT - barH + 18;
      for (const para of beat.text.split("\n")) {
        let line = "";
        for (const w of para.split(/\s+/).filter(Boolean)) {
          const test = line + (line ? " " : "") + w;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, 24, y);
            y += 20;
            line = w;
          } else {
            line = test;
          }
        }
        if (line) {
          ctx.fillText(line, 24, y);
          y += 22;
        }
      }
    }
  }

  if (phase === "won") {
    ctx.fillStyle = "rgba(22, 18, 14, 0.72)";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f5edd8";
    ctx.font = 'italic bold 24px Georgia, "Times New Roman", serif';
    ctx.fillText("The end of this folio", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 44);
    ctx.font = "15px ui-monospace, monospace";
    ctx.fillStyle = "#c9b896";
    ctx.fillText(
      `Time ${formatFolioTime(state.runElapsedMs ?? 0)}`,
      VIEW_WIDTH / 2,
      VIEW_HEIGHT / 2 - 14,
    );
    if (winHud?.newRecord) {
      ctx.font = "13px Georgia, serif";
      ctx.fillStyle = "#7dd3a8";
      ctx.fillText("New personal best", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 10);
    }
    ctx.font = "13px Georgia, serif";
    ctx.globalAlpha = 0.88 + 0.12 * Math.sin(nowMs * 0.0018);
    ctx.fillStyle = "#d4b896";
    ctx.fillText(
      "You read the room.",
      VIEW_WIDTH / 2,
      VIEW_HEIGHT / 2 + (winHud?.newRecord ? 34 : 14),
    );
    ctx.globalAlpha = 1;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#b8a88c";
    ctx.fillText(
      "M / Esc — folio map · R — run again",
      VIEW_WIDTH / 2,
      VIEW_HEIGHT / 2 + (winHud?.newRecord ? 58 : 38),
    );
    ctx.textAlign = "left";
  }
}
