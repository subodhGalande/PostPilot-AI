export function BlueprintGraphic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      className="w-full max-w-md opacity-80"
      {...props}
    >
      <title>Blueprint Graphic</title>
      {/* Structural Base Lines */}
      <g
        stroke="currentColor"
        className="text-zinc-200"
        strokeWidth="1"
        fill="none"
      >
        <line x1="50" y1="0" x2="50" y2="400" />
        <line x1="150" y1="0" x2="150" y2="400" />
        <line x1="250" y1="0" x2="250" y2="400" />
        <line x1="350" y1="0" x2="350" y2="400" />

        <line x1="0" y1="100" x2="400" y2="100" />
        <line x1="0" y1="200" x2="400" y2="200" />
        <line x1="0" y1="300" x2="400" y2="300" />
      </g>

      {/* Primary Data Pathway */}
      <g
        stroke="currentColor"
        className="text-zinc-300"
        strokeWidth="1.5"
        fill="none"
      >
        <path d="M 50 100 L 150 100 L 150 200 L 250 200 L 250 300 L 350 300" />
        <path
          d="M 150 300 L 250 300 L 250 100 L 350 100"
          strokeDasharray="4 4"
        />
      </g>

      {/* Nodes / Intersections */}
      <g className="text-zinc-400" fill="currentColor">
        <circle cx="50" cy="100" r="3" />
        <circle cx="150" cy="100" r="3" />
        <circle cx="150" cy="200" r="4" />
        <circle cx="250" cy="200" r="4" />
        <circle cx="250" cy="100" r="3" />
        <circle cx="250" cy="300" r="3" />
        <circle cx="350" cy="300" r="3" />
        <circle cx="350" cy="100" r="3" />
      </g>

      {/* Technical Labels */}
      <g
        className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider"
        fill="currentColor"
      >
        <text x="56" y="96">
          INPUT_01
        </text>
        <text x="156" y="96">
          QUEUE_A
        </text>
        <text x="156" y="212">
          PROCESS_SYNC
        </text>
        <text x="256" y="196">
          ANALYTICS_V1
        </text>
        <text x="256" y="96">
          FAILOVER
        </text>
        <text x="256" y="312">
          DISTRIBUTE
        </text>
        <text x="356" y="296">
          END_POINT_B
        </text>
      </g>

      {/* Architectural Accents (Crosshairs) */}
      <g stroke="currentColor" className="text-zinc-300" strokeWidth="1">
        {/* Crosshair 1 */}
        <line x1="45" y1="200" x2="55" y2="200" />
        <line x1="50" y1="195" x2="50" y2="205" />
        {/* Crosshair 2 */}
        <line x1="345" y1="200" x2="355" y2="200" />
        <line x1="350" y1="195" x2="350" y2="205" />
      </g>
    </svg>
  );
}
