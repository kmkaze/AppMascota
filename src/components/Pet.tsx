import React from 'react';
import Svg, { Circle, Ellipse, Path, G, Line } from 'react-native-svg';
import { colors } from '../theme/colors';

// All expressions supported across the app's screens
export type PetExpression =
  | 'happy'
  | 'sad'
  | 'scared'
  | 'dizzy'
  | 'neutral'
  | 'sleeping';

interface PetProps {
  size?: number;
  expression?: PetExpression;
}

// All coordinates use a fixed 100×100 viewBox; `size` only scales the rendered output
const Pet: React.FC<PetProps> = ({ size = 120, expression = 'happy' }) => {
  const isNormalEyes =
    expression === 'happy' ||
    expression === 'sad' ||
    expression === 'neutral';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* ── Ears ── */}
      <Circle cx="27" cy="21" r="16" fill={colors.petBody} />
      <Circle cx="27" cy="21" r="9" fill={colors.petInnerEar} />
      <Circle cx="73" cy="21" r="16" fill={colors.petBody} />
      <Circle cx="73" cy="21" r="9" fill={colors.petInnerEar} />

      {/* ── Body ── */}
      {/* Subtle drop shadow */}
      <Circle cx="51" cy="57" r="42" fill={colors.petInnerEar} opacity="0.25" />
      <Circle cx="50" cy="55" r="42" fill={colors.petBody} />

      {/* ── Blush ── */}
      <Ellipse cx="28" cy="64" rx="10" ry="5.5" fill={colors.petBlush} opacity="0.6" />
      <Ellipse cx="72" cy="64" rx="10" ry="5.5" fill={colors.petBlush} opacity="0.6" />

      {/* ── Eyes ── */}

      {/* Normal eyes (happy / sad / neutral): filled ellipses with highlight */}
      {isNormalEyes && (
        <G>
          <Ellipse cx="40" cy="47" rx="6" ry="6.5" fill={colors.petEye} />
          <Circle cx="38" cy="45" r="2" fill={colors.white} />
          <Ellipse cx="60" cy="47" rx="6" ry="6.5" fill={colors.petEye} />
          <Circle cx="58" cy="45" r="2" fill={colors.white} />
        </G>
      )}

      {/* Sleeping eyes: downward-arc lines (eyelids closed) */}
      {expression === 'sleeping' && (
        <G>
          <Path
            d="M 34 48 Q 40 54 46 48"
            stroke={colors.petEye}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 54 48 Q 60 54 66 48"
            stroke={colors.petEye}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      )}

      {/* Dizzy eyes: × marks */}
      {expression === 'dizzy' && (
        <G>
          <Line x1="34" y1="43" x2="46" y2="53" stroke={colors.petEye} strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="46" y1="43" x2="34" y2="53" stroke={colors.petEye} strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="54" y1="43" x2="66" y2="53" stroke={colors.petEye} strokeWidth="2.5" strokeLinecap="round" />
          <Line x1="66" y1="43" x2="54" y2="53" stroke={colors.petEye} strokeWidth="2.5" strokeLinecap="round" />
        </G>
      )}

      {/* Scared eyes: large white circles with tiny pupils */}
      {expression === 'scared' && (
        <G>
          <Circle cx="40" cy="47" r="7.5" fill={colors.white} />
          <Circle cx="40" cy="47" r="3.5" fill={colors.petEye} />
          <Circle cx="38" cy="45" r="1.2" fill={colors.white} />
          <Circle cx="60" cy="47" r="7.5" fill={colors.white} />
          <Circle cx="60" cy="47" r="3.5" fill={colors.petEye} />
          <Circle cx="58" cy="45" r="1.2" fill={colors.white} />
        </G>
      )}

      {/* ── Mouth ── */}

      {expression === 'happy' && (
        <Path
          d="M 42 68 Q 50 76 58 68"
          stroke={colors.petMouth}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'sad' && (
        <Path
          d="M 42 73 Q 50 66 58 73"
          stroke={colors.petMouth}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Scared: open oval mouth */}
      {expression === 'scared' && (
        <Ellipse cx="50" cy="70" rx="7" ry="5.5" fill={colors.petMouth} />
      )}

      {/* Dizzy: wavy ~S line */}
      {expression === 'dizzy' && (
        <Path
          d="M 42 68 Q 46 74 50 68 Q 54 62 58 68"
          stroke={colors.petMouth}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'sleeping' && (
        <Path
          d="M 44 69 Q 50 73 56 69"
          stroke={colors.petMouth}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {expression === 'neutral' && (
        <Line
          x1="44" y1="68"
          x2="56" y2="68"
          stroke={colors.petMouth}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
};

export default Pet;
