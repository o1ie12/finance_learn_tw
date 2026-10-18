import type { ChatData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KeyTag, Mark, cx, isHl, isOn, type DocumentProps, type FindMode } from "./fields";
import s from "./documents.module.css";

/**
 * A chat thread in a generic messaging app (not any real app's UI or logo).
 * Links stay plain text; an image is a gray placeholder with its caption.
 * `mode: "call"` shows a phone call as a transcript.
 *
 * Field ids: msg:<i>
 */

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5-5-8 8" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

function initial(name: string): string {
  return Array.from(name.trim())[0] ?? "?";
}

type Msg = ChatData["messages"][number];

function Bubble({ m }: { m: Msg }) {
  return (
    <span className={s.bubbleCol}>
      {m.image && (
        <span className={s.imgPh}>
          <ImageIcon />
          <span>圖片：{m.image}</span>
        </span>
      )}
      {m.text && <span className={s.bubble}>{m.text}</span>}
    </span>
  );
}

function ChatMessage({
  m,
  i,
  contact,
  find,
  highlight,
}: {
  m: Msg;
  i: number;
  contact: string;
  find?: FindMode;
  highlight?: readonly string[];
}) {
  const id = `msg:${i}`;
  const mine = m.from === "me";
  const who = mine ? "你" : contact;
  const hl = isHl(highlight, id);
  const avatar = !mine && (
    <span className={cx(s.avatar, s.avatarSm)} aria-hidden="true">
      {initial(contact)}
    </span>
  );
  const spoken = (
    <span className="sr-only">
      {who} {m.time}：
    </span>
  );
  const time = (
    <span className={s.time} aria-hidden="true">
      {m.time}
    </span>
  );

  if (find) {
    return (
      <li className={cx(s.msg, mine ? s.msgMe : s.msgThem, hl && s.msgHl)} data-field={id}>
        {avatar}
        <button
          type="button"
          aria-pressed={isOn(find, id)}
          disabled={find.disabled}
          onClick={() => find.onToggle(id)}
          className={s.msgPick}
        >
          {spoken}
          <Bubble m={m} />
          <Mark />
        </button>
        {time}
        {hl && <KeyTag />}
      </li>
    );
  }

  return (
    <li className={cx(s.msg, mine ? s.msgMe : s.msgThem, hl && s.msgHl)} data-field={id}>
      {avatar}
      {spoken}
      <Bubble m={m} />
      {time}
      {hl && <KeyTag />}
    </li>
  );
}

function CallLine({
  m,
  i,
  contact,
  find,
  highlight,
}: {
  m: Msg;
  i: number;
  contact: string;
  find?: FindMode;
  highlight?: readonly string[];
}) {
  const id = `msg:${i}`;
  const mine = m.from === "me";
  const hl = isHl(highlight, id);
  const body = (
    <span className={cx(s.callLine, mine && s.callLineMe, hl && !find && s.hl)}>
      <span className={s.callWho}>
        {mine ? "你" : contact} {m.time}
        {hl && <KeyTag />}
      </span>
      <span>{m.text}</span>
      {m.image && <span className={s.subtitle}>（{m.image}）</span>}
    </span>
  );
  return (
    <li data-field={id}>
      {find ? (
        <button
          type="button"
          aria-pressed={isOn(find, id)}
          disabled={find.disabled}
          onClick={() => find.onToggle(id)}
          className={cx(s.callPick, hl && s.hl)}
        >
          {body}
          <Mark />
        </button>
      ) : (
        body
      )}
    </li>
  );
}

export default function ChatThread({
  data,
  find,
  highlight,
  headingLevel,
}: { data: ChatData } & DocumentProps) {
  const call = data.mode === "call";
  return (
    <DocumentFrame title={call ? "通話紀錄" : "聊天訊息"} headingLevel={headingLevel}>
      <div className={s.chatHead}>
        <span className={s.avatar} aria-hidden="true">
          {initial(data.contact)}
        </span>
        <div>
          <p className={s.title}>{data.contact}</p>
          {call && <p className={s.subtitle}>來電</p>}
        </div>
      </div>

      {call ? (
        <div className={s.section}>
          <p className={s.callBanner}>
            <PhoneIcon />
            通話內容的文字紀錄
          </p>
          <ol className={s.callList}>
            {data.messages.map((m, i) => (
              <CallLine key={i} m={m} i={i} contact={data.contact} find={find} highlight={highlight} />
            ))}
          </ol>
        </div>
      ) : (
        <div className={s.section}>
          <ol className={s.chatBody} aria-label={`與 ${data.contact} 的訊息`}>
            {data.messages.map((m, i) => (
              <ChatMessage key={i} m={m} i={i} contact={data.contact} find={find} highlight={highlight} />
            ))}
          </ol>
        </div>
      )}
    </DocumentFrame>
  );
}
