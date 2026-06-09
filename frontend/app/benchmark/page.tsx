"use client";

import { useEffect, useMemo, useState } from "react";
import Trie from "../utils/trie";

type TrieBenchmarkResult = {
  datasetSize: number;
  queryCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  averageHits: number;
  samplePrefix: string;
  sampleHits: number;
};

function createSeededRandom(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDataset(size: number, seed: number) {
  const random = createSeededRandom(seed);
  return Array.from({ length: size }, () => {
    const value = Math.floor(random() * 200000);
    return random() > 0.5 ? value : -value;
  });
}

function formatMs(value: number) {
  return `${value.toFixed(3)} ms`;
}

export default function BenchmarkPage() {
  const [result, setResult] = useState<TrieBenchmarkResult | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);

    const datasetSize = 5000;
    const queryCount = 500;
    const names = generateDataset(datasetSize, 42).map((value) => `Professor ${Math.abs(value)}`);
    const trie = new Trie();

    for (let index = 0; index < names.length; index += 1) {
      trie.insert(names[index], { id: index, nome: names[index] });
    }

    const prefixes = Array.from({ length: queryCount }, () => {
      const selectedName = names[Math.floor(Math.random() * names.length)];
      const prefixLength = Math.max(2, Math.min(5, selectedName.length - 1));
      return selectedName.slice(0, prefixLength);
    });

    let totalHits = 0;
    const samplePrefix = prefixes[0] ?? "Pro";

    const start = performance.now();
    for (const prefix of prefixes) {
      totalHits += trie.searchPrefix(prefix, 100).length;
    }
    const end = performance.now();

    const sampleHits = trie.searchPrefix(samplePrefix, 100).length;

    setResult({
      datasetSize,
      queryCount,
      totalTimeMs: Number((end - start).toFixed(3)),
      averageTimeMs: Number(((end - start) / queryCount).toFixed(6)),
      averageHits: Number((totalHits / queryCount).toFixed(2)),
      samplePrefix,
      sampleHits,
    });
    setLastRunAt(new Date().toLocaleString("pt-BR"));
    setRunning(false);
  };

  useEffect(() => {
    void runBenchmark();
  }, []);

  const headline = useMemo(() => {
    if (!result) {
      return "Preparando benchmark da Trie...";
    }

    return `Trie executada sobre ${result.datasetSize.toLocaleString("pt-BR")} nomes com ${result.queryCount.toLocaleString("pt-BR")} consultas.`;
  }, [result]);

  return (
    <main className="min-h-screen bg-[#050036] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Benchmark da Trie</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Busca por prefixo com árvore eficiente
              </h1>
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Esta página mede o desempenho da Trie criada para a busca por nome e departamento. O objetivo é mostrar, de forma simples, como a estrutura reduz o custo de consultas por prefixo em uma base maior de professores simulados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void runBenchmark()}
              disabled={running}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {running ? "Executando..." : "Executar benchmark"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Base simulada</p>
              <p className="mt-2 text-2xl font-semibold">5.000 nomes</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Consultas</p>
              <p className="mt-2 text-2xl font-semibold">500 buscas</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Última execução</p>
              <p className="mt-2 text-lg font-semibold">{lastRunAt ?? "Aguardando"}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 xl:col-span-2">
            <h2 className="text-2xl font-semibold">Resultado do benchmark</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              O tempo informado corresponde ao custo total de execução das consultas por prefixo na Trie.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
              {result ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Tempo total</p>
                    <p className="mt-2 text-3xl font-semibold text-cyan-300">{formatMs(result.totalTimeMs)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Tempo médio</p>
                    <p className="mt-2 text-3xl font-semibold">{result.averageTimeMs.toFixed(6)} ms</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Média de resultados</p>
                    <p className="mt-2 text-3xl font-semibold">{result.averageHits.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-4 sm:col-span-2 xl:col-span-3">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Amostra da consulta</p>
                    <p className="mt-2 text-base text-slate-200">
                      Prefixo <span className="font-semibold text-cyan-300">{result.samplePrefix}</span> retornou <span className="font-semibold text-cyan-300">{result.sampleHits}</span> correspondências.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300">{headline}</p>
              )}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold">Interpretações</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>• A Trie é adequada para buscas por prefixo, como nome e departamento.</li>
                <li>• Quanto menor o tempo médio, melhor o comportamento da estrutura para consultas repetidas.</li>
                <li>• A mesma base pode ser reutilizada na busca da Home e nas sugestões de texto.</li>
              </ul>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}