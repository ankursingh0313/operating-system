'use client'

import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

const STARS_SMALL = '501px 811px #fff, 1450px 1324px #fff, 1093px 1780px #fff, 1469px 678px #fff, 904px 741px #fff, 1160px 781px #fff, 1841px 1962px #fff, 1630px 1667px #fff, 1788px 676px #fff, 367px 1734px #fff, 1343px 156px #fff, 1283px 1142px #fff, 1062px 378px #fff, 1395px 467px #fff, 1017px 1891px #fff, 137px 1114px #fff, 1767px 1403px #fff, 1543px 11px #fff, 1078px 181px #fff, 1189px 1574px #fff, 1697px 1551px #fff, 439px 472px #fff, 1491px 677px #fff, 1364px 599px #fff, 34px 382px #fff, 1221px 1584px #fff, 1266px 1499px #fff, 169px 1907px #fff, 1219px 1125px #fff, 659px 18px #fff, 1731px 1959px #fff, 332px 1216px #fff, 1913px 788px #fff, 80px 712px #fff, 326px 1605px #fff, 574px 1502px #fff, 473px 1653px #fff, 404px 975px #fff, 322px 1797px #fff, 425px 1321px #fff, 1121px 1797px #fff, 731px 647px #fff, 891px 1584px #fff, 1523px 109px #fff, 1379px 244px #fff, 865px 1064px #fff, 493px 956px #fff, 624px 1380px #fff, 440px 619px #fff, 1630px 767px #fff, 955px 1196px #fff, 62px 729px #fff, 126px 946px #fff, 1256px 896px #fff, 1444px 256px #fff, 661px 1628px #fff, 1078px 1716px #fff, 300px 737px #fff, 1734px 413px #fff, 1296px 129px #fff, 1771px 1678px #fff, 977px 1764px #fff, 1879px 549px #fff, 665px 1531px #fff, 89px 701px #fff, 1084px 1183px #fff, 1597px 1576px #fff, 1354px 1774px #fff, 554px 1471px #fff, 1469px 287px #fff'
const STARS_MEDIUM = '1925px 1320px #fff, 693px 1778px #fff, 1016px 711px #fff, 1171px 563px #fff, 661px 1919px #fff, 1610px 44px #fff, 1275px 140px #fff, 1208px 1802px #fff, 1473px 1587px #fff, 11px 1117px #fff, 853px 1757px #fff, 1149px 937px #fff, 1353px 428px #fff, 270px 279px #fff, 258px 1404px #fff, 417px 1188px #fff, 286px 561px #fff, 393px 1765px #fff, 147px 881px #fff, 666px 1097px #fff, 1425px 1278px #fff, 806px 156px #fff, 1252px 561px #fff, 218px 52px #fff, 1371px 1980px #fff, 171px 745px #fff, 1424px 89px #fff, 137px 244px #fff, 939px 1922px #fff, 137px 1080px #fff, 1757px 50px #fff, 904px 536px #fff, 1938px 1001px #fff, 1172px 440px #fff, 72px 1475px #fff'
const STARS_LARGE = '200px 981px #fff, 1731px 521px #fff, 132px 1039px #fff, 1888px 1547px #fff, 899px 1226px #fff, 1887px 580px #fff, 1548px 1092px #fff, 1626px 689px #fff, 254px 1072px #fff, 1684px 1211px #fff, 672px 1267px #fff, 939px 668px #fff, 1969px 645px #fff, 1126px 983px #fff, 457px 568px #fff, 476px 876px #fff, 829px 1896px #fff, 1364px 1846px #fff, 1507px 1120px #fff, 936px 1948px #fff'

export default function Wallpaper() {
  const { accent, wallpaper } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[accent]

  // 1. Glowing Gradient Orbs Wallpaper
  if (wallpaper === 'gradient') {
    return (
      <div className="absolute inset-0 z-0 bg-gray-950 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className={`absolute w-[700px] h-[700px] rounded-full bg-gradient-to-tr ${theme.gradient} opacity-25 blur-[110px] will-change-transform animate-pulse`} />
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[90px]" />
      </div>
    )
  }

  // 2. Cybernetic Perspective Grid Wallpaper
  if (wallpaper === 'grid') {
    return (
      <div 
        className="absolute inset-0 z-0 bg-[#030308] overflow-hidden pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${theme.rawPrimary} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme.rawPrimary} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
      </div>
    )
  }

  // 3. Radar Scanner Wallpaper
  if (wallpaper === 'radar') {
    return (
      <>
        <style>{`
          .radar-pattern {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-color: #09090b;
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
          .radar-grid {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(${theme.rawPrimary} 0.1em, transparent 0.1em),
                              linear-gradient(90deg, ${theme.rawPrimary} 0.1em, transparent 0.1em);
            background-size: 3em 3em;
            opacity: 0.25; 
            z-index: 0;
          }
          .radar-pattern::before {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            width: 150vw; height: 150vh;
            transform: translate(-50%, -50%);
            background: repeating-radial-gradient(circle, transparent 0, transparent 2.9em, ${theme.rawPrimary} 3em);
            opacity: 0.25;
            z-index: 1;
          }
          .radar-pattern::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            width: 40em; height: 40em;
            margin-top: -20em; margin-left: -20em;
            border-radius: 50%;
            background: conic-gradient(from 0deg, transparent 75%, ${theme.rawPrimary} 100%);
            animation: radar-spin 4s linear infinite;
            will-change: transform;
            z-index: 2;
          }
          .radar-center {
            position: absolute;
            top: 50%; left: 50%;
            width: 1em; height: 1em;
            transform: translate(-50%, -50%);
            background-color: ${theme.rawSecondary};
            border-radius: 50%;
            z-index: 3;
            animation: pulse-dot 2s ease-in-out infinite;
          }
          @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-dot {
            0%, 100% { box-shadow: 0 0 0.8em 0.2em ${theme.rawPrimary}; }
            50% { box-shadow: 0 0 2em 0.5em ${theme.rawSecondary}; }
          }
        `}</style>
        <div className="radar-pattern">
          <div className="radar-grid"></div>
          <div className="radar-center"></div>
        </div>
      </>
    )
  }

  // 4. Animated Starry Night Wallpaper
  if (wallpaper === 'stars') {
    return (
      <>
        <style>{`
          .starry-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at bottom, ${theme.rawPrimary} 0%, #090a0f 100%);
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
          #stars, #stars2, #stars3 {
            position: absolute;
            top: 0; left: 0;
            background: transparent;
            will-change: transform;
          }
          #stars { width: 1px; height: 1px; box-shadow: ${STARS_SMALL}; animation: animStar 60s linear infinite; }
          #stars::after { content: " "; position: absolute; top: 2000px; width: 1px; height: 1px; background: transparent; box-shadow: ${STARS_SMALL}; }
          #stars2 { width: 2px; height: 2px; box-shadow: ${STARS_MEDIUM}; animation: animStar 110s linear infinite; }
          #stars2::after { content: " "; position: absolute; top: 2000px; width: 2px; height: 2px; background: transparent; box-shadow: ${STARS_MEDIUM}; }
          #stars3 { width: 3px; height: 3px; box-shadow: ${STARS_LARGE}; animation: animStar 160s linear infinite; }
          #stars3::after { content: " "; position: absolute; top: 2000px; width: 3px; height: 3px; background: transparent; box-shadow: ${STARS_LARGE}; }
          @keyframes animStar {
            from { transform: translate3d(0, 0px, 0); }
            to   { transform: translate3d(0, -2000px, 0); }
          }
        `}</style>
        <div className="starry-container">
          <div id="stars" />
          <div id="stars2" />
          <div id="stars3" />
        </div>
      </>
    )
  }

  // 5. Custom Geometric Pattern Wallpaper
  if (wallpaper === 'geometric') {
    return (
      <>
        <style>{`
          .geometric-wallpaper {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle farthest-side at 0% 50%, #18181b 23.5%, transparent 0) 21px 30px,
                        radial-gradient(circle farthest-side at 0% 50%, ${theme.rawPrimary} 24%, transparent 0) 19px 30px,
                        linear-gradient(#18181b 14%, transparent 0, transparent 85%, #18181b 0) 0 0,
                        linear-gradient(150deg, #18181b 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, #18181b 0) 0 0,
                        linear-gradient(30deg, #18181b 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, #18181b 0) 0 0,
                        linear-gradient(90deg, ${theme.rawPrimary} 2%, #18181b 0, #18181b 98%, ${theme.rawPrimary} 0%) 0 0 #18181b;
            background-size: 40px 60px;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
        `}</style>
        <div className="geometric-wallpaper" />
      </>
    )
  }

  // 6. Cracked Earth Wallpaper
  if (wallpaper === 'terrain') {
    return (
      <>
        <style>{`
          .cracked-earth-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-color: ${theme.rawPrimary};
            overflow: hidden;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
          .cracked-earth {
            width: 100%;
            height: 100%;
            filter: url(#cracks);
            transform: translateZ(0);
            opacity: 0.3;
          }
        `}</style>

        <div className="cracked-earth-container">
          <div className="cracked-earth"></div>
        </div>

        <svg width="0" height="0" className="absolute pointer-events-none">
          <filter id="cracks" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="5"
              seed="10"
              result="noise"
            />
            <feColorMatrix
              type="luminanceToAlpha"
              in="noise"
              result="alphaNoise"
            />
            <feComponentTransfer in="alphaNoise" result="plates">
              <feFuncA type="discrete" tableValues="0 1" />
            </feComponentTransfer>
            <feConvolveMatrix
              order="3 3"
              kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
              in="plates"
              result="edges"
            />
            <feComponentTransfer in="edges" result="invertedEdges">
              <feFuncR type="table" tableValues="1 0" />
              <feFuncG type="table" tableValues="1 0" />
              <feFuncB type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feFlood flood-color="#fff" result="bgColor" />
            <feComposite operator="in" in="bgColor" in2="invertedEdges" />
          </filter>
        </svg>
      </>
    )
  }
  // 7. Pattern Squares Wallpaper
  if (wallpaper === 'squares') {
    return (
      <>
        <style>{`
          .pattern-square {
            --mx: 0;
            --my: 0;
            --a-x: calc(var(--mx) * 8px);
            --a-y: calc(var(--my) * 8px);
            --b-x: calc(var(--mx) * -6px);
            --b-y: calc(var(--my) * -6px);
            --c-x: calc(var(--mx) * 4px);
            --c-y: calc(var(--my) * 4px);

            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background:
              repeating-linear-gradient(
                  45deg,
                  #0000 calc(-650% / 13) calc(50% / 13),
                  #100f0f 0 calc(100% / 13),
                  #0000 0 calc(150% / 13),
                  #100f0f 0 calc(200% / 13),
                  #0000 0 calc(250% / 13),
                  #100f0f 0 calc(300% / 13)
                )
                calc(0px + var(--c-x)) calc(0px + var(--c-y)),
              repeating-linear-gradient(
                  45deg,
                  #0000 calc(-650% / 13) calc(50% / 13),
                  #100f0f 0 calc(100% / 13),
                  #0000 0 calc(150% / 13),
                  #100f0f 0 calc(200% / 13),
                  #0000 0 calc(250% / 13),
                  #100f0f 0 calc(300% / 13)
                )
                calc(32px + var(--a-x)) calc(32px + var(--a-y)),
              repeating-linear-gradient(
                  -45deg,
                  #0000 calc(-650% / 13) calc(50% / 13),
                  #100f0f 0 calc(100% / 13),
                  #0000 0 calc(150% / 13),
                  #100f0f 0 calc(200% / 13),
                  #0000 0 calc(250% / 13),
                  #100f0f 0 calc(300% / 13)
                )
                calc(0px + var(--b-x)) calc(0px + var(--b-y)),
              repeating-linear-gradient(
                  -45deg,
                  ${theme.rawPrimary} calc(-650% / 13) calc(50% / 13),
                  #100f0f 0 calc(100% / 13),
                  ${theme.rawPrimary} 0 calc(150% / 13),
                  #100f0f 0 calc(200% / 13),
                  ${theme.rawPrimary} 0 calc(250% / 13),
                  #100f0f 0 calc(300% / 13)
                )
                calc(32px + var(--a-x)) calc(32px + var(--a-y)) #1e1e1e;

            background-size: 64px 64px;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
        `}</style>
        <div className="pattern-square" />
      </>
    )
  }
  // 8. Modern Geometric Mesh Wallpaper (Theme-Aware)
  if (wallpaper === 'mesh') {
    return (
      <>
        <style>{`
          .theme-mesh-wallpaper {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-color: #0f172a;
            background-image:
              linear-gradient(
                45deg,
                ${theme.rawPrimary} 25%,
                transparent 25%,
                transparent 75%,
                ${theme.rawPrimary} 75%
              ),
              linear-gradient(
                -45deg,
                ${theme.rawPrimary} 25%,
                transparent 25%,
                transparent 75%,
                ${theme.rawPrimary} 75%
              ),
              linear-gradient(
                45deg,
                transparent 40%,
                ${theme.rawPrimary} 40%,
                ${theme.rawPrimary} 60%,
                transparent 60%
              ),
              linear-gradient(
                -45deg,
                transparent 40%,
                ${theme.rawPrimary} 40%,
                ${theme.rawPrimary} 60%,
                transparent 60%
              ),
              radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
            background-size:
              60px 60px,
              60px 60px,
              120px 120px,
              120px 120px,
              100% 100%;
            background-position:
              0 0,
              30px 30px,
              0 0,
              60px 60px,
              0 0;
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }

          .theme-mesh-wallpaper::before {
            content: "";
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.03) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px,
                transparent 10px
              ),
              repeating-linear-gradient(
                -45deg,
                rgba(255, 255, 255, 0.03) 0px,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px,
                transparent 10px
              );
            background-size: 20px 20px;
            filter: blur(0.5px);
          }
        `}</style>
        <div className="theme-mesh-wallpaper" />
      </>
    )
  }
  // 10. Gradient Ripple Pattern Wallpaper (Theme-Aware)
  if (wallpaper === 'ripple') {
    return (
      <>
        <style>{`
          .theme-ripple-wallpaper {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            --s: 100px;
            --c1: ${theme.rgb};
            --c2: #1b1b3a;

            --_g: var(--c2) 6% 14%, var(--c1) 16% 24%, var(--c2) 26% 34%,
              var(--c1) 36% 44%, var(--c2) 46% 54%, var(--c1) 56% 64%, var(--c2) 66% 74%,
              var(--c1) 76% 84%, var(--c2) 86% 94%;
            background: radial-gradient(
                100% 100% at 100% 0,
                var(--c1) 4%,
                var(--_g),
                #0008 96%,
                #0000
              ),
              radial-gradient(
                  100% 100% at 0 100%,
                  #0000,
                  #0008 4%,
                  var(--_g),
                  var(--c1) 96%
                )
                var(--c1);
            background-size: var(--s) var(--s);
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
        `}</style>
        <div className="theme-ripple-wallpaper" />
      </>
    )
  }
  // 11. Geometric Mosaic Wallpaper (Theme-Aware)
  if (wallpaper === 'mosaic') {
    return (
      <>
        <style>{`
          .theme-mosaic-wallpaper {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            --s: 60px;
            --c1: #180a22;
            --c2: ${theme.rgb};
            --_g: radial-gradient(
              25% 25% at 25% 25%,
              var(--c1) 99%,
              rgba(0, 0, 0, 0) 101%
            );
            background: var(--_g) var(--s) var(--s) / calc(2 * var(--s))
                calc(2 * var(--s)),
              var(--_g) 0 0 / calc(2 * var(--s)) calc(2 * var(--s)),
              radial-gradient(50% 50%, var(--c2) 98%, rgba(0, 0, 0, 0)) 0 0 / var(--s)
                var(--s),
              repeating-conic-gradient(var(--c2) 0 50%, var(--c1) 0 100%)
                calc(0.5 * var(--s)) 0 / calc(2 * var(--s)) var(--s);
            z-index: 0;
            pointer-events: none;
            contain: strict;
          }
        `}</style>
        <div className="theme-mosaic-wallpaper" />
      </>
    )
  }
  return null
}