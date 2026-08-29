import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { WeightLog } from '../../types/auth';

interface Props {
  logs: WeightLog[];
  targetWeightKg?: number;
  height?: number;
  width?: number;
}

export const WeightTrendChart: React.FC<Props> = ({
  logs,
  targetWeightKg,
  height = 200,
  width = Dimensions.get('window').width - 48,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<{ weight: number; date: string } | null>(null);

  if (!logs || logs.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height, width }]}>
        <Text style={styles.emptyText}>No weight entries yet</Text>
        <Text style={styles.emptySubtext}>Log your weight to see your smooth trend curve</Text>
      </View>
    );
  }

  // Margins within the chart
  const paddingX = 24;
  const paddingY = 28;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Extract weights and timestamps
  const weights = logs.map((l) => l.weightKg);
  if (targetWeightKg) weights.push(targetWeightKg);

  const minWeight = Math.floor(Math.min(...weights) - 1.5);
  const maxWeight = Math.ceil(Math.max(...weights) + 1.5);
  const weightRange = Math.max(1, maxWeight - minWeight);

  // Map logs to SVG coordinates
  const points = logs.map((l, index) => {
    const x =
      logs.length === 1
        ? paddingX + chartW / 2
        : paddingX + (index / (logs.length - 1)) * chartW;
    const y = paddingY + chartH - ((l.weightKg - minWeight) / weightRange) * chartH;
    return { x, y, weight: l.weightKg, date: new Date(l.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });

  // Calculate smooth cubic Bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Gradient area closed path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Target weight line Y coordinate
  const targetY = targetWeightKg
    ? paddingY + chartH - ((targetWeightKg - minWeight) / weightRange) * chartH
    : null;

  return (
    <View style={[styles.container, { width, height }]}>
      {selectedPoint && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipWeight}>{selectedPoint.weight} kg</Text>
          <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
        </View>
      )}

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Target Weight Dashed Reference Line */}
        {targetY !== null && (
          <Line
            x1={paddingX}
            y1={targetY}
            x2={width - paddingX}
            y2={targetY}
            stroke={Colors.accent}
            strokeWidth={1.5}
            strokeDasharray="4, 4"
            opacity={0.8}
          />
        )}

        {/* Area Gradient Fill */}
        {points.length > 1 && <Path d={areaD} fill="url(#gradientFill)" />}

        {/* Smooth Cubic Bezier Trend Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={Colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Point Nodes */}
        {points.map((pt, idx) => (
          <Circle
            key={`pt_${idx}`}
            cx={pt.x}
            cy={pt.y}
            r={5}
            fill={Colors.surfaceCard}
            stroke={Colors.primary}
            strokeWidth={2.5}
            onPress={() => setSelectedPoint({ weight: pt.weight, date: pt.date })}
          />
        ))}
      </Svg>

      {/* Target indicator tag */}
      {targetWeightKg && (
        <View style={styles.targetLegend}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.legendText}>Goal: {targetWeightKg} kg</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipWeight: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  tooltipDate: {
    color: Colors.primaryLight,
    fontSize: 11,
  },
  targetLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    left: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
