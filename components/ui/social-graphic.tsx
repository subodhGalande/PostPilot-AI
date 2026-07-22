export function SocialGraphic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      className="w-full max-w-md"
      {...props}
    >
      <title>Social Graphic</title>
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="12"
            floodColor="#000000"
            floodOpacity="0.04"
          />
        </filter>
        <filter id="shadow-sm" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="6"
            floodColor="#000000"
            floodOpacity="0.03"
          />
        </filter>
      </defs>

      {/* Abstract Calendar Grid Background */}
      <g
        stroke="currentColor"
        className="text-zinc-200"
        strokeWidth="1"
        fill="none"
      >
        {/* Calendar columns */}
        <line x1="100" y1="40" x2="100" y2="360" />
        <line x1="200" y1="40" x2="200" y2="360" />
        <line x1="300" y1="40" x2="300" y2="360" />

        {/* Calendar rows */}
        <line x1="50" y1="100" x2="350" y2="100" />
        <line x1="50" y1="180" x2="350" y2="180" />
        <line x1="50" y1="260" x2="350" y2="260" />
      </g>

      {/* Calendar Block - Scheduled Post */}
      <rect
        x="204"
        y="104"
        width="92"
        height="72"
        rx="6"
        className="fill-zinc-100/50"
      />
      <rect
        x="104"
        y="184"
        width="92"
        height="72"
        rx="6"
        className="fill-zinc-100/50"
      />

      {/* Main Social Post Card (Abstracted) */}
      <g filter="url(#shadow)">
        <rect
          x="60"
          y="80"
          width="180"
          height="220"
          rx="16"
          fill="white"
          className="stroke-zinc-200"
          strokeWidth="1"
        />

        {/* Profile Section */}
        <circle cx="90" cy="110" r="12" className="fill-zinc-100" />
        <rect
          x="112"
          y="104"
          width="60"
          height="4"
          rx="2"
          className="fill-zinc-200"
        />
        <rect
          x="112"
          y="114"
          width="40"
          height="4"
          rx="2"
          className="fill-zinc-100"
        />

        {/* Post Content */}
        <rect
          x="75"
          y="140"
          width="150"
          height="4"
          rx="2"
          className="fill-zinc-200"
        />
        <rect
          x="75"
          y="152"
          width="140"
          height="4"
          rx="2"
          className="fill-zinc-200"
        />
        <rect
          x="75"
          y="164"
          width="110"
          height="4"
          rx="2"
          className="fill-zinc-200"
        />

        {/* Post Image/Media Attachment */}
        <rect
          x="75"
          y="184"
          width="150"
          height="80"
          rx="8"
          className="fill-zinc-50 stroke-zinc-100"
          strokeWidth="1"
        />

        {/* Engagement Icons (Abstract) */}
        <circle cx="85" cy="280" r="4" className="fill-zinc-200" />
        <circle cx="105" cy="280" r="4" className="fill-zinc-200" />
        <circle cx="125" cy="280" r="4" className="fill-zinc-200" />
      </g>

      {/* Analytics / Growth Popover Card */}
      <g filter="url(#shadow-sm)">
        <rect
          x="210"
          y="180"
          width="140"
          height="110"
          rx="12"
          fill="white"
          className="stroke-zinc-200"
          strokeWidth="1"
        />

        {/* Chart Header */}
        <rect
          x="225"
          y="195"
          width="40"
          height="4"
          rx="2"
          className="fill-zinc-300"
        />
        <rect
          x="225"
          y="205"
          width="20"
          height="4"
          rx="2"
          className="fill-zinc-200"
        />

        {/* Mini Bar Chart */}
        <rect
          x="230"
          y="260"
          width="12"
          height="15"
          rx="2"
          className="fill-zinc-100"
        />
        <rect
          x="250"
          y="250"
          width="12"
          height="25"
          rx="2"
          className="fill-zinc-100"
        />
        <rect
          x="270"
          y="235"
          width="12"
          height="40"
          rx="2"
          className="fill-zinc-200"
        />
        <rect
          x="290"
          y="215"
          width="12"
          height="60"
          rx="2"
          className="fill-primary/20"
        />

        {/* Growth Trend Line Overlay */}
        <path
          d="M 235 255 L 255 240 L 275 220 L 295 200"
          className="stroke-primary text-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="295" cy="200" r="3" className="fill-primary" />
      </g>

      {/* AI Sparkle / Magic Accent (Floating) */}
      <g
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M110 50 l 4 12 l 12 4 l -12 4 l -4 12 l -4 -12 l -12 -4 l 12 -4 z"
          className="fill-primary/10"
        />
        <path
          d="M130 35 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z"
          className="fill-primary/10"
        />
      </g>
    </svg>
  );
}
