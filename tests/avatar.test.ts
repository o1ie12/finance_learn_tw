/**
 * Character avatar (01-DESIGN-SYSTEM §6.2): schema, name rules, and RULE 6.
 *
 * RULE 6 (00-MASTER-PROMPT): no avatar part or visual state may depend on
 * money, spending, purchases or course standing. These tests check it
 * structurally, by parsing the source with the TypeScript compiler (so
 * comments explaining the rule are never scanned):
 *  (a) every *Props type in Avatar.tsx has only the allowed keys;
 *  (b) no identifier, string or JSX text in components/avatar or
 *      lib/avatar.ts matches the forbidden pattern;
 *  (c) palette entries carry only { id, label, hex } and every one parses.
 *
 * Run: npx tsx --test tests/avatar.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import {
  AVATAR_PALETTES,
  AvatarSchema,
  DEFAULT_AVATAR,
  FACES,
  HAIRS,
  HAIR_COLORS,
  OUTFITS,
  OUTFIT_COLORS,
  PART_KINDS,
  SKIN_TONES,
  moodFromStressLevel,
  readAvatar,
  validateName,
} from "@/lib/avatar";

const ROOT = join(__dirname, "..");

// ---------- schema ----------

test("DEFAULT_AVATAR parses and matches the mockup character", () => {
  assert.deepEqual(AvatarSchema.parse(DEFAULT_AVATAR), DEFAULT_AVATAR);
  assert.equal(DEFAULT_AVATAR.hair, "short");
  assert.equal(DEFAULT_AVATAR.outfit, "hoodie");
});

test("palettes have the §6.2 counts and exact hex values", () => {
  assert.equal(SKIN_TONES.length, 6);
  assert.equal(FACES.length, 6);
  assert.equal(HAIRS.length, 8);
  assert.equal(HAIR_COLORS.length, 6);
  assert.equal(OUTFITS.length, 6);
  assert.equal(OUTFIT_COLORS.length, 8);
  assert.deepEqual(
    SKIN_TONES.map((s) => s.hex),
    ["#F3CDA6", "#E8B88E", "#D9A27A", "#C68B62", "#A86E4A", "#7E5236"],
  );
  assert.deepEqual(
    HAIR_COLORS.map((s) => s.hex),
    ["#2A1E17", "#4A3426", "#7A5230", "#B07A3C", "#1B1B1B", "#8E3B5C"],
  );
  assert.deepEqual(
    OUTFIT_COLORS.map((s) => s.hex),
    ["#2F6FDB", "#13906B", "#C4471C", "#7A4FD0", "#2B3440", "#B8860B", "#C2185B", "#E9EEF2"],
  );
});

test("schema accepts every option of every part, and samples of combinations", () => {
  // Each option on its own, against the default for the rest.
  for (const kind of PART_KINDS) {
    for (const option of AVATAR_PALETTES[kind]) {
      const r = AvatarSchema.safeParse({ ...DEFAULT_AVATAR, [kind]: option.id });
      assert.ok(r.success, `${kind}=${option.id} should parse`);
    }
  }
  // A walk through combinations: each step changes every part, with
  // co-prime strides so many pairings are covered.
  for (let i = 0; i < 240; i++) {
    const a = {
      version: 1,
      skin: SKIN_TONES[i % 6].id,
      face: FACES[(i * 5) % 6].id,
      hair: HAIRS[(i * 3) % 8].id,
      hairColor: HAIR_COLORS[(i * 7) % 6].id,
      outfit: OUTFITS[(i * 11) % 6].id,
      outfitColor: OUTFIT_COLORS[(i * 13) % 8].id,
      name: "小宇",
    };
    assert.ok(AvatarSchema.safeParse(a).success, JSON.stringify(a));
  }
});

test("schema rejects unknown options, wrong version, and missing fields", () => {
  assert.equal(AvatarSchema.safeParse({ ...DEFAULT_AVATAR, hair: "mohawk" }).success, false);
  assert.equal(AvatarSchema.safeParse({ ...DEFAULT_AVATAR, skin: "#FFFFFF" }).success, false);
  assert.equal(AvatarSchema.safeParse({ ...DEFAULT_AVATAR, version: 2 }).success, false);
  const { outfit: _drop, ...noOutfit } = DEFAULT_AVATAR;
  void _drop;
  assert.equal(AvatarSchema.safeParse(noOutfit).success, false);
});

test("readAvatar returns a valid avatar or null, never throws", () => {
  assert.deepEqual(readAvatar(DEFAULT_AVATAR), DEFAULT_AVATAR);
  assert.deepEqual(readAvatar(JSON.stringify(DEFAULT_AVATAR)), DEFAULT_AVATAR);
  assert.deepEqual(readAvatar({ ...DEFAULT_AVATAR, name: "  小宇  " })?.name, "小宇");
  for (const bad of [null, undefined, 42, "", "{", [], {}, { ...DEFAULT_AVATAR, name: "<b>hi</b>" }]) {
    assert.equal(readAvatar(bad), null, JSON.stringify(bad));
  }
});

test("moodFromStressLevel maps stress levels to moods", () => {
  assert.equal(moodFromStressLevel("low"), "calm");
  assert.equal(moodFromStressLevel("mid"), "tense");
  assert.equal(moodFromStressLevel("high"), "stressed");
});

// ---------- name ----------

test("validateName accepts 2 to 8 plain characters, trimmed", () => {
  for (const [input, value] of [
    ["小宇", "小宇"],
    ["  阿明  ", "阿明"],
    ["Amy", "Amy"],
    ["王小明同學你好", "王小明同學你好"],
    ["一二三四五六七八", "一二三四五六七八"],
    ["Mr. Lee", "Mr. Lee"],
    ["𠮷野家", "𠮷野家"], // surrogate pair counts as one character
  ] as const) {
    assert.deepEqual(validateName(input), { ok: true, value }, input);
  }
});

test("validateName rejects wrong lengths, links, HTML and control characters", () => {
  const cases = [
    "",
    "   ",
    "宇",
    " 宇 ",
    "一二三四五六七八九",
    "http://a.tw",
    "https:x",
    "www.ab",
    "ab.com",
    "看 a.tw",
    "AB.COM",
    "ftp://x",
    "<b>小宇",
    "小宇>",
    "a<b",
    "小\u0000宇",
    "小\n宇",
    "小‮宇",
    "小​宇",
  ];
  for (const input of cases) {
    const r = validateName(input);
    assert.equal(r.ok, false, JSON.stringify(input));
    if (!r.ok) assert.match(r.reason, /[一-鿿]/, "reason is in Chinese");
  }
  assert.equal(validateName(123).ok, false);
});

// ---------- RULE 6 ----------

const FORBIDDEN = /money|cash|netWorth|spend|purchase|price|wealth|salary|income|progress|unlock|points/i;
const ALLOWED_PROPS = new Set(["avatar", "mood", "view", "size", "title", "className"]);

function sourceFile(path: string): ts.SourceFile {
  const text = readFileSync(path, "utf8");
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
}

function avatarFiles(): string[] {
  const dir = join(ROOT, "components", "avatar");
  return [
    ...readdirSync(dir)
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .map((f) => join(dir, f)),
    join(ROOT, "lib", "avatar.ts"),
  ];
}

/** Every name a reader of the code would see, comments excluded. */
function codeWords(sf: ts.SourceFile): string[] {
  const words: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) words.push(node.text);
    else if (ts.isStringLiteralLike(node) || ts.isJsxText(node)) words.push(node.text);
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      words.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return words;
}

function propsKeys(sf: ts.SourceFile): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const membersOf = (members: ts.NodeArray<ts.TypeElement>) =>
    members.map((m) => (m.name ? m.name.getText(sf) : "<index>"));
  ts.forEachChild(sf, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith("Props")) {
      assert.equal(node.heritageClauses, undefined, `${node.name.text} must not extend other types`);
      found.set(node.name.text, membersOf(node.members));
    }
    if (ts.isTypeAliasDeclaration(node) && node.name.text.endsWith("Props")) {
      assert.ok(ts.isTypeLiteralNode(node.type), `${node.name.text} must be a plain object type`);
      found.set(node.name.text, membersOf(node.type.members));
    }
  });
  return found;
}

test("RULE 6 (a): Avatar.tsx props are only avatar, mood, view, size, title, className", () => {
  const props = propsKeys(sourceFile(join(ROOT, "components", "avatar", "Avatar.tsx")));
  assert.ok(props.has("AvatarProps"), "AvatarProps interface exists");
  for (const [name, keys] of props) {
    for (const key of keys) {
      assert.ok(ALLOWED_PROPS.has(key), `${name}.${key} is not an allowed avatar input`);
    }
  }
});

test("RULE 6 (b): no avatar source mentions money, spending or standing", () => {
  const files = avatarFiles();
  assert.ok(files.length >= 6, "found the avatar files");
  const hits: string[] = [];
  for (const path of files) {
    for (const word of codeWords(sourceFile(path))) {
      if (FORBIDDEN.test(word)) hits.push(`${path.replace(ROOT, "")}: ${word}`);
    }
  }
  assert.deepEqual(hits, []);
});

test("RULE 6 (c): every option is open, with no gate field in any palette", () => {
  for (const kind of PART_KINDS) {
    const list = AVATAR_PALETTES[kind];
    assert.ok(list.length >= 6, `${kind} has at least 6 options`);
    for (const option of list) {
      const keys = Object.keys(option);
      assert.ok(
        keys.every((k) => k === "id" || k === "label" || k === "hex"),
        `${kind}.${option.id} has only id/label/hex, got ${keys.join(",")}`,
      );
      assert.ok(option.label.length > 0);
    }
    // The schema accepts exactly the palette's ids: nothing hidden, nothing extra.
    const schemaOptions = (AvatarSchema.shape[kind] as unknown as { options: string[] }).options;
    assert.deepEqual([...schemaOptions].sort(), list.map((o) => o.id).sort());
  }
});
