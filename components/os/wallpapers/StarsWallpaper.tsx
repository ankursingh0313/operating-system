'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

const STARS_SMALL_RAW = '501px 811px, 1450px 1324px, 1093px 1780px, 1469px 678px, 904px 741px, 1160px 781px, 1841px 1962px, 1630px 1667px, 1788px 676px, 367px 1734px, 1343px 156px, 1283px 1142px, 1062px 378px, 1395px 467px, 1017px 1891px, 137px 1114px, 1767px 1403px, 1543px 11px, 1078px 181px, 1189px 1574px, 1697px 1551px, 439px 472px, 1491px 677px, 1364px 599px, 34px 382px, 1221px 1584px, 1266px 1499px, 169px 1907px, 1219px 1125px, 659px 18px, 1731px 1959px, 332px 1216px, 1913px 788px, 80px 712px, 326px 1605px, 574px 1502px, 473px 1653px, 404px 975px, 322px 1797px, 425px 1321px, 1121px 1797px, 731px 647px, 891px 1584px, 1523px 109px, 1379px 244px, 865px 1064px, 493px 956px, 624px 1380px, 440px 619px, 1630px 767px, 955px 1196px, 62px 729px, 126px 946px, 1256px 896px, 1444px 256px, 661px 1628px, 1078px 1716px, 300px 737px, 1734px 413px, 1296px 129px, 1771px 1678px, 977px 1764px, 1879px 549px, 665px 1531px, 89px 701px, 1084px 1183px, 1597px 1576px, 1354px 1774px, 554px 1471px, 1469px 287px'
const STARS_MEDIUM_RAW = '1925px 1320px, 693px 1778px, 1016px 711px, 1171px 563px, 661px 1919px, 1610px 44px, 1275px 140px, 1208px 1802px, 1473px 1587px, 11px 1117px, 853px 1757px, 1149px 937px, 1353px 428px, 270px 279px, 258px 1404px, 417px 1188px, 286px 561px, 393px 1765px, 147px 881px, 666px 1097px, 1425px 1278px, 806px 156px, 1252px 561px, 218px 52px, 1371px 1980px, 171px 745px, 1424px 89px, 137px 244px, 939px 1922px, 137px 1080px, 1757px 50px, 904px 536px, 1938px 1001px, 1172px 440px, 72px 1475px'
const STARS_LARGE_RAW = '200px 981px, 1731px 521px, 132px 1039px, 1888px 1547px, 899px 1226px, 1887px 580px, 1548px 1092px, 1626px 689px, 254px 1072px, 1684px 1211px, 672px 1267px, 939px 668px, 1969px 645px, 1126px 983px, 457px 568px, 476px 876px, 829px 1896px, 1364px 1846px, 1507px 1120px, 936px 1948px'

function buildStarShadows(coords: string, color: string): string {
  return coords
    .split(',')
    .map((pair) => `${pair.trim()} ${color}`)
    .join(', ')
}

export default function StarsWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  const skyTop = isLight ? surface.rawBg : '#090a0f'
  const starColor = isLight ? 'rgba(15, 23, 42, 0.55)' : '#fff'

  const starsSmall = buildStarShadows(STARS_SMALL_RAW, starColor)
  const starsMedium = buildStarShadows(STARS_MEDIUM_RAW, starColor)
  const starsLarge = buildStarShadows(STARS_LARGE_RAW, starColor)

  return (
    <>
      <style>{`
        .starry-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at bottom, ${theme.rawPrimary} 0%, ${skyTop} 100%);
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
        #stars { width: 1px; height: 1px; box-shadow: ${starsSmall}; animation: animStar 60s linear infinite; }
        #stars::after { content: " "; position: absolute; top: 2000px; width: 1px; height: 1px; background: transparent; box-shadow: ${starsSmall}; }
        #stars2 { width: 2px; height: 2px; box-shadow: ${starsMedium}; animation: animStar 110s linear infinite; }
        #stars2::after { content: " "; position: absolute; top: 2000px; width: 2px; height: 2px; background: transparent; box-shadow: ${starsMedium}; }
        #stars3 { width: 3px; height: 3px; box-shadow: ${starsLarge}; animation: animStar 160s linear infinite; }
        #stars3::after { content: " "; position: absolute; top: 2000px; width: 3px; height: 3px; background: transparent; box-shadow: ${starsLarge}; }
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