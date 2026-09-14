import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "wallet"
  | "store"
  | "pix"
  | "transactions"
  | "link"
  | "calendar"
  | "payout"
  | "routing"
  | "code"
  | "settings"
  | "search"
  | "bell"
  | "help"
  | "deposit"
  | "transfer"
  | "withdraw"
  | "shield"
  | "webhook"
  | "check"
  | "chart"
  | "clock"
  | "arrow";

export function Icon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  return (
    <svg className={["icon", className].filter(Boolean).join(" ")} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <g {...common}>
        {name === "home" ? <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></> : null}
        {name === "wallet" ? <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19v16H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 7h15M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"/><path d="M16 13.5h.01"/></> : null}
        {name === "store" ? <><path d="M4 9h16l-1.5-5h-13zM5 9v11h14V9"/><path d="M9 20v-6h6v6M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></> : null}
        {name === "pix" ? <><path d="m8.2 6.1 2.1-2.1a2.4 2.4 0 0 1 3.4 0l2.1 2.1M15.8 17.9 13.7 20a2.4 2.4 0 0 1-3.4 0l-2.1-2.1"/><path d="m3.8 10.3 6.5-6.5M20.2 13.7l-6.5 6.5M7.6 12l4.4-4.4 4.4 4.4-4.4 4.4z"/></> : null}
        {name === "transactions" ? <><path d="M4 7h14M14 3l4 4-4 4M20 17H6M10 13l-4 4 4 4"/></> : null}
        {name === "link" ? <><path d="m10 13 4-4"/><path d="M7.5 16.5 5 19a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.5 7.5 19 5a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" transform="scale(.86) translate(2 2)"/></> : null}
        {name === "calendar" ? <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></> : null}
        {name === "payout" ? <><path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/></> : null}
        {name === "routing" ? <><circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 6v5M6.5 17.5 12 11l5.5 6.5"/></> : null}
        {name === "code" ? <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></> : null}
        {name === "settings" ? <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></> : null}
        {name === "search" ? <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></> : null}
        {name === "bell" ? <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></> : null}
        {name === "help" ? <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-1 .7-1.5 1.1-1.5 2.2M12 17h.01"/></> : null}
        {name === "deposit" ? <><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></> : null}
        {name === "transfer" ? <><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></> : null}
        {name === "withdraw" ? <><path d="M12 20V8M7 13l5-5 5 5"/><path d="M4 4h16"/></> : null}
        {name === "shield" ? <><path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/></> : null}
        {name === "webhook" ? <><circle cx="12" cy="5" r="3"/><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M9.5 6.7 6.8 14M14.5 6.7l2.7 7.3M8 17h8"/></> : null}
        {name === "check" ? <path d="m5 12 4 4L19 6"/> : null}
        {name === "chart" ? <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></> : null}
        {name === "clock" ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> : null}
        {name === "arrow" ? <><path d="M5 12h14M14 7l5 5-5 5"/></> : null}
      </g>
    </svg>
  );
}
