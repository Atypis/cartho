'use client';

/**
 * Flowchart Node Components
 *
 * Different shapes for different node types:
 * - Diamond: Decision points (primitive evaluations)
 * - Rectangle: Composite gates (AND/OR)
 * - Rounded rectangle: Terminal states (compliant/non-compliant)
 */

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, EvaluationResult, Question, Context } from '@/lib/evaluation/types';

interface FlowchartNodeData {
  label: string;
  kind: 'composite' | 'primitive' | 'terminal';
  operator?: 'allOf' | 'anyOf';
  status: NodeStatus;
  result?: EvaluationResult;
  error?: string;
  question?: Question;
  context?: Context;
}

export const FlowchartDecisionNode = memo(({ data, selected }: NodeProps & { data: FlowchartNodeData }) => {
  const { label, status, result, error, question, context } = data;
  const [expanded, setExpanded] = useState(false);

  const getStatusStyle = () => {
    switch (status) {
      case 'evaluating': return {
        gradient: 'from-blue-500/10 via-cyan-500/10 to-blue-500/10',
        border: 'border-blue-400/30',
        glow: 'shadow-blue-500/20',
        icon: <div className="relative flex items-center justify-center w-5 h-5">
          <div className="absolute w-full h-full rounded-full bg-blue-500/20 animate-ping" />
          <div className="relative w-2 h-2 rounded-full bg-blue-500" />
        </div>,
        badge: 'bg-blue-500/10 text-blue-600 border-blue-400/30'
      };
      case 'completed':
        return result?.decision
          ? {
              gradient: 'from-emerald-500/10 via-green-500/10 to-emerald-500/10',
              border: 'border-emerald-400/30',
              glow: 'shadow-emerald-500/20',
              icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20">
                <span className="text-emerald-600 font-bold text-xs">✓</span>
              </div>,
              badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/30'
            }
          : {
              gradient: 'from-rose-500/10 via-red-500/10 to-rose-500/10',
              border: 'border-rose-400/30',
              glow: 'shadow-rose-500/20',
              icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20">
                <span className="text-rose-600 font-bold text-xs">✗</span>
              </div>,
              badge: 'bg-rose-500/10 text-rose-600 border-rose-400/30'
            };
      case 'error': return {
        gradient: 'from-red-500/10 via-orange-500/10 to-red-500/10',
        border: 'border-red-400/30',
        glow: 'shadow-red-500/20',
        icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
          <span className="text-red-600 font-bold text-xs">!</span>
        </div>,
        badge: 'bg-red-500/10 text-red-600 border-red-400/30'
      };
      default: return {
        gradient: 'from-slate-500/5 via-slate-400/5 to-slate-500/5',
        border: 'border-slate-300/30',
        glow: 'shadow-slate-500/10',
        icon: <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-500/10">
          <span className="text-slate-400 font-light text-xs">○</span>
        </div>,
        badge: 'bg-slate-500/10 text-slate-600 border-slate-400/30'
      };
    }
  };

  const style = getStatusStyle();

  return (
    <div
      className={`group relative transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-[1.02]'}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Glass morphism card */}
      <div
        className={`
          relative w-72 h-24
          bg-gradient-to-br ${style.gradient}
          backdrop-blur-xl bg-white/80
          border ${style.border}
          rounded-2xl
          shadow-xl ${style.glow}
          transition-all duration-300
          cursor-pointer
          overflow-hidden
        `}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        {/* Content */}
        <div className="relative h-full flex items-center gap-3 px-4 py-3">
          {/* Status icon */}
          <div className="flex-shrink-0">
            {style.icon}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2 mb-1">
              {label}
            </div>
            {status === 'completed' && result && (
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${style.badge}`}>
                <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                {(result.confidence * 100).toFixed(0)}% confidence
              </div>
            )}
          </div>
        </div>

        {/* Handles with glow effect */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!w-3 !h-3 !bg-gradient-to-br !from-slate-300 !to-slate-400 !border-2 !border-white/50 !shadow-lg !shadow-slate-500/30"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!w-3 !h-3 !bg-gradient-to-br !from-slate-300 !to-slate-400 !border-2 !border-white/50 !shadow-lg !shadow-slate-500/30"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!w-3 !h-3 !bg-gradient-to-br !from-slate-300 !to-slate-400 !border-2 !border-white/50 !shadow-lg !shadow-slate-500/30"
        />
      </div>

      {/* Expanded detail card below diamond */}
      {expanded && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-80 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 text-xs">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          >
            ✕
          </button>

          <div className="space-y-3">
            {question && (
              <div>
                <div className="font-semibold text-gray-700 mb-1">Question:</div>
                <div className="text-gray-600 italic">{question.prompt}</div>
                {question.help && (
                  <div className="mt-1 text-gray-500">
                    <span className="font-medium">Guidance:</span> {question.help}
                  </div>
                )}
              </div>
            )}

            {context && context.items && context.items.length > 0 && (
              <div>
                <div className="font-semibold text-gray-700 mb-1">Legal Context:</div>
                <div className="space-y-2">
                  {context.items.map((item, idx) => (
                    <div key={idx} className="pl-2 border-l-2 border-gray-300">
                      <div className="font-medium text-gray-600">{item.label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'completed' && result && (
              <div className="border-t pt-3">
                <div className="font-semibold text-gray-700 mb-1">Result:</div>
                <div className="space-y-1">
                  <div>
                    <span className={result.decision ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {result.decision ? 'YES ✓' : 'NO ✗'}
                    </span>
                    {' '}(Confidence: {(result.confidence * 100).toFixed(0)}%)
                  </div>
                  <div className="text-gray-600 bg-gray-50 p-2 rounded mt-2">
                    {result.reasoning}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-2 rounded">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

FlowchartDecisionNode.displayName = 'FlowchartDecisionNode';

export const FlowchartGateNode = memo(({ data, selected }: NodeProps & { data: FlowchartNodeData }) => {
  const { label, operator, status } = data;

  const getColor = () => {
    switch (status) {
      case 'evaluating': return 'border-blue-400 bg-blue-50';
      case 'completed': return 'border-purple-500 bg-purple-50';
      case 'error': return 'border-red-600 bg-red-100';
      default: return 'border-purple-300 bg-purple-50';
    }
  };

  return (
    <div className={`${selected ? 'ring-2 ring-blue-400 ring-offset-2 rounded-lg' : ''}`}>
      <div className={`
        px-6 py-3 rounded-lg border-2 shadow-md
        flex items-center gap-2 min-w-[150px] justify-center
        ${getColor()}
      `}>
        <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />

        <div className="text-center">
          <div className="text-xs font-mono px-2 py-1 bg-purple-200 text-purple-800 rounded mb-1">
            {operator === 'allOf' ? 'ALL' : operator === 'anyOf' ? 'ANY' : 'GATE'}
          </div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
        </div>

        <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        <Handle type="source" position={Position.Left} id="left" className="!bg-gray-400 !w-3 !h-3" />
        <Handle type="source" position={Position.Right} id="right" className="!bg-gray-400 !w-3 !h-3" />
      </div>
    </div>
  );
});

FlowchartGateNode.displayName = 'FlowchartGateNode';

export const FlowchartTerminalNode = memo(({ data, selected }: NodeProps & { data: FlowchartNodeData }) => {
  const { label } = data;

  const isSuccess = label.includes('✓') || label.toLowerCase().includes('met');
  const isFailure = label.includes('✗') || label.toLowerCase().includes('not');

  const getStyle = () => {
    if (isSuccess) return {
      gradient: 'from-emerald-500/20 via-green-500/15 to-emerald-500/20',
      border: 'border-emerald-400/40',
      glow: 'shadow-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      iconText: 'text-emerald-600',
      text: 'text-emerald-700',
      pulse: 'bg-emerald-500'
    };
    if (isFailure) return {
      gradient: 'from-rose-500/20 via-red-500/15 to-rose-500/20',
      border: 'border-rose-400/40',
      glow: 'shadow-rose-500/30',
      iconBg: 'bg-rose-500/20',
      iconText: 'text-rose-600',
      text: 'text-rose-700',
      pulse: 'bg-rose-500'
    };
    return {
      gradient: 'from-slate-500/10 via-slate-400/5 to-slate-500/10',
      border: 'border-slate-300/40',
      glow: 'shadow-slate-500/20',
      iconBg: 'bg-slate-500/10',
      iconText: 'text-slate-600',
      text: 'text-slate-700',
      pulse: 'bg-slate-500'
    };
  };

  const style = getStyle();

  return (
    <div className={`group transition-all duration-300 ${selected ? 'scale-105' : 'hover:scale-[1.02]'}`}>
      <div className={`
        relative px-6 py-4
        bg-gradient-to-br ${style.gradient}
        backdrop-blur-xl bg-white/80
        border ${style.border}
        rounded-2xl
        shadow-xl ${style.glow}
        transition-all duration-300
        overflow-hidden
      `}>
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 0.7s, opacity 0.7s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />

        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-gradient-to-br !from-slate-300 !to-slate-400 !border-2 !border-white/50 !shadow-lg !shadow-slate-500/30"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!w-3 !h-3 !bg-gradient-to-br !from-slate-300 !to-slate-400 !border-2 !border-white/50 !shadow-lg !shadow-slate-500/30"
        />

        <div className="relative flex items-center gap-3">
          {/* Pulsing icon */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full ${style.pulse} opacity-20 animate-ping`} />
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${style.iconBg}`}>
              <span className={`${style.iconText} font-bold text-sm`}>
                {isSuccess ? '✓' : isFailure ? '✗' : '○'}
              </span>
            </div>
          </div>

          {/* Text */}
          <div className={`text-xs font-semibold ${style.text} tracking-tight`}>
            {label.replace(/[✓✗]/g, '').trim()}
          </div>
        </div>
      </div>
    </div>
  );
});

FlowchartTerminalNode.displayName = 'FlowchartTerminalNode';
