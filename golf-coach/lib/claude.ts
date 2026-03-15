import Anthropic from "@anthropic-ai/sdk";
import { CoachingAnalysis, HoleData, ParsedRoundData, RoundStats } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseScreenshots(
  imageBase64Array: string[],
  mimeTypes: string[] = []
): Promise<ParsedRoundData> {
  const imageContent = imageBase64Array.map((base64, i) => {
    const raw = mimeTypes[i] || "image/jpeg";
    const media_type = (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(raw)
      ? raw
      : "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    return {
      type: "image" as const,
      source: { type: "base64" as const, media_type, data: base64 },
    };
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `You are analyzing screenshots from the 18 Birdies golf tracking app. Extract ALL golf round data from these screenshots.

Return a JSON object with this EXACT structure (no extra text, just valid JSON):
{
  "course_name": "string",
  "date": "YYYY-MM-DD",
  "holes_played": 9 or 18,
  "gross_score": number,
  "net_score": number or null,
  "par": number,
  "holes": [
    {
      "hole": 1,
      "par": 4,
      "handicap": 3,
      "score": 6,
      "fairway_hit": true/false/null,
      "gir": true/false,
      "putts": 2,
      "chip_shots": 1,
      "sand_shots": 0,
      "penalties": 0
    }
  ],
  "notes": "any notes visible in the screenshots"
}

Rules:
- fairway_hit: true=checkmark, false=X circle, null=dash (N/A, par 3s)
- gir: true=checkmark, false=X circle
- Extract EVERY hole shown across all screenshots
- date format must be YYYY-MM-DD
- If a stat is not visible, use 0`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse round data from screenshots");

  const rawData = JSON.parse(jsonMatch[0]);
  const stats = calculateStats(rawData.holes, rawData.holes_played);
  return { ...rawData, stats };
}

function calculateStats(holes: HoleData[], holesPlayed: number): RoundStats {
  let fairways_hit = 0, fairways_attempted = 0, gir = 0;
  let total_putts = 0, chip_shots = 0, sand_shots = 0, penalties = 0;
  let pars_or_better = 0, bogeys_or_worse = 0;
  const gir_attempted = holes.length;

  for (const hole of holes) {
    if (hole.fairway_hit !== null) {
      fairways_attempted++;
      if (hole.fairway_hit) fairways_hit++;
    }
    if (hole.gir) gir++;
    total_putts += hole.putts || 0;
    chip_shots += hole.chip_shots || 0;
    sand_shots += hole.sand_shots || 0;
    penalties += hole.penalties || 0;
    if (hole.score <= hole.par) pars_or_better++;
    else bogeys_or_worse++;
  }

  return {
    fairways_hit, fairways_attempted,
    fairway_percentage: fairways_attempted > 0 ? Math.round((fairways_hit / fairways_attempted) * 100) : 0,
    gir, gir_attempted,
    gir_percentage: gir_attempted > 0 ? Math.round((gir / gir_attempted) * 100) : 0,
    total_putts,
    putts_per_hole: holesPlayed > 0 ? Math.round((total_putts / holesPlayed) * 10) / 10 : 0,
    chip_shots, sand_shots, penalties, pars_or_better, bogeys_or_worse,
  };
}

export async function generateCoachingAnalysis(
  roundData: ParsedRoundData,
  recentRounds: Array<{
    date: string; gross_score: number; par: number;
    fairway_pct: number; gir_pct: number; total_putts: number; chip_shots: number;
  }>
): Promise<CoachingAnalysis> {
  const scoreToPar = roundData.gross_score - roundData.par;
  const recentTrend = recentRounds.length > 1
    ? recentRounds.slice(0, 5).map(r =>
        `${r.date}: ${r.gross_score} (${r.gross_score - r.par > 0 ? "+" : ""}${r.gross_score - r.par}), FW: ${r.fairway_pct}%, GIR: ${r.gir_pct}%, Putts: ${r.total_putts}`
      ).join("\n")
    : "No previous rounds yet";

  const holeBreakdown = roundData.holes.map(h =>
    `H${h.hole} (Par ${h.par}): Score ${h.score} (${h.score - h.par > 0 ? "+" : ""}${h.score - h.par}), FW: ${h.fairway_hit === null ? "N/A" : h.fairway_hit ? "✓" : "✗"}, GIR: ${h.gir ? "✓" : "✗"}, Putts: ${h.putts}, Chips: ${h.chip_shots}, Sand: ${h.sand_shots}, Pen: ${h.penalties}`
  ).join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `You are an expert PGA-level golf coach. Your student Michael is a 14-handicap golfer with a goal of reaching single digits this season (starting April 15). He has access to a driving range and a small putting green. He plays 9 holes every week and goes to the range about once a week.

TODAY'S ROUND:
Course: ${roundData.course_name}
Date: ${roundData.date}
Holes: ${roundData.holes_played}
Score: ${roundData.gross_score} (${scoreToPar > 0 ? "+" : ""}${scoreToPar} vs par ${roundData.par})
Net Score: ${roundData.net_score || "N/A"}

STATS:
- Fairways Hit: ${roundData.stats.fairways_hit}/${roundData.stats.fairways_attempted} (${roundData.stats.fairway_percentage}%)
- Greens in Regulation: ${roundData.stats.gir}/${roundData.stats.gir_attempted} (${roundData.stats.gir_percentage}%)
- Total Putts: ${roundData.stats.total_putts} (${roundData.stats.putts_per_hole} per hole)
- Chip Shots: ${roundData.stats.chip_shots}
- Sand Shots: ${roundData.stats.sand_shots}
- Penalties: ${roundData.stats.penalties}
- Pars or Better: ${roundData.stats.pars_or_better}
- Bogeys or Worse: ${roundData.stats.bogeys_or_worse}

HOLE-BY-HOLE:
${holeBreakdown}

RECENT HISTORY:
${recentTrend}

${roundData.notes ? `NOTES: ${roundData.notes}` : ""}

Return ONLY valid JSON in this exact format:
{
  "recap": "2-3 sentence honest, encouraging round recap",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1 with context", "weakness 2 with context", "weakness 3 with context"],
  "priority_focus": "The single most impactful thing to work on right now (1-2 sentences)",
  "trend_note": "Observation vs recent rounds (omit if no history)",
  "drills": [
    {
      "title": "Drill name",
      "description": "Detailed step-by-step instructions",
      "duration": "e.g. 20 minutes",
      "focus_area": "e.g. Fairway Accuracy",
      "difficulty": "beginner"
    }
  ]
}

Provide 3-4 drills for the weakest areas. All drills must be doable at a driving range or putting green. Be specific, practical, and encouraging.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not generate coaching analysis");

  const analysis = JSON.parse(jsonMatch[0]);
  return { ...analysis, score_to_par: scoreToPar };
}
