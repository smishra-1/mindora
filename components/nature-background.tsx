/** Decorative, fixed backdrop: soft sky, a faint leaf pattern, drifting clouds and rolling hills. */
export function NatureBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* sun glow */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgb(253_235_156/0.55),transparent_65%)] sm:size-[28rem]" />

      {/* faint pattern of leaves, flowers and sparkles, clear in the middle where content sits */}
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern id="nature-tile" width="220" height="220" patternUnits="userSpaceOnUse">
            <g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {/* leaf */}
              <g transform="translate(22 26) rotate(-30)" stroke="#5bb36a">
                <path d="M0 8C4 0 14 0 18 8C14 16 4 16 0 8Z" />
                <path d="M2 8H15" />
              </g>
              {/* little flower */}
              <g transform="translate(150 150)" stroke="#9b3fd8">
                <circle r="2.5" />
                <circle cx="0" cy="-6" r="3" />
                <circle cx="5.7" cy="-1.9" r="3" />
                <circle cx="3.5" cy="4.9" r="3" />
                <circle cx="-3.5" cy="4.9" r="3" />
                <circle cx="-5.7" cy="-1.9" r="3" />
              </g>
              {/* second leaf */}
              <g transform="translate(176 52) rotate(35)" stroke="#5bb36a">
                <path d="M0 6C3 0 10 0 13 6C10 12 3 12 0 6Z" />
              </g>
              {/* sparkle */}
              <path d="M50 170v8M46 174h8" stroke="#e0b400" />
              {/* sprout */}
              <g transform="translate(96 92)" stroke="#5bb36a">
                <path d="M0 8V0" />
                <path d="M0 3C-4 3-6 0-6-3C-2-3 0 0 0 3Z" />
                <path d="M0 1C4 1 6-2 6-5C2-5 0-2 0 1Z" />
              </g>
            </g>
            <circle cx="110" cy="30" r="1.8" fill="#9fd0f7" />
            <circle cx="200" cy="200" r="1.5" fill="#fcc6cc" />
          </pattern>
          <radialGradient id="nature-fade" cx="50%" cy="42%" r="75%">
            <stop offset="0.35" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id="nature-mask">
            <rect width="100%" height="100%" fill="url(#nature-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#nature-tile)" mask="url(#nature-mask)" opacity="0.32" />
      </svg>

      {/* drifting clouds */}
      <Cloud className="drift-slow absolute left-[6%] top-24 w-36 opacity-70 sm:w-48" />
      <Cloud className="drift-slower absolute right-[18%] top-44 hidden w-28 opacity-50 sm:block" />
      {/* a pair of birds */}
      <svg viewBox="0 0 60 20" className="absolute left-[30%] top-32 hidden w-12 opacity-40 sm:block" fill="none" stroke="#6f6787" strokeWidth="2" strokeLinecap="round">
        <path d="M2 10Q8 3 14 10Q20 3 26 10" />
        <path d="M36 15Q40 10 44 15Q48 10 52 15" />
      </svg>

      {/* rolling hills */}
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-32 w-full sm:h-52"
      >
        <path d="M0 120C200 60 380 70 560 110C760 155 960 60 1180 70C1300 75 1380 95 1440 110V220H0Z" fill="#b6efc4" opacity="0.45" />
        <path d="M0 165C240 115 470 130 700 160C930 190 1150 120 1440 145V220H0Z" fill="#a8e6a8" opacity="0.5" />
        <g stroke="#5bb36a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M180 150v-10M176 150l-4-7M184 150l4-7" />
          <path d="M860 172v-10M856 172l-4-7M864 172l4-7" />
          <path d="M1290 140v-10M1286 140l-4-7M1294 140l4-7" />
        </g>
        <g opacity="0.7">
          <path d="M420 152v-16" stroke="#5bb36a" strokeWidth="2" />
          <circle cx="420" cy="134" r="5" fill="#fcc6cc" stroke="#2b2140" strokeOpacity="0.25" />
          <path d="M1080 150v-14" stroke="#5bb36a" strokeWidth="2" />
          <circle cx="1080" cy="134" r="4.5" fill="#fdeb9c" stroke="#2b2140" strokeOpacity="0.25" />
          <path d="M640 160v-12" stroke="#5bb36a" strokeWidth="2" />
          <circle cx="640" cy="146" r="4" fill="#e4dbfb" stroke="#2b2140" strokeOpacity="0.25" />
        </g>
      </svg>
    </div>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 50" className={className}>
      <path
        d="M22 44C10 44 4 37 4 30C4 22 11 17 19 18C21 9 29 4 38 5C45 6 51 10 53 16C57 10 64 7 72 8C84 9 92 18 91 28C100 27 112 32 112 38C112 42 108 44 102 44Z"
        fill="#fff"
        stroke="#e6def5"
        strokeWidth="2"
      />
    </svg>
  );
}
