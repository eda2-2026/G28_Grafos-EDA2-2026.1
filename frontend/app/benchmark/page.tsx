"use client";

import { useEffect, useMemo, useState } from "react";
import { insertionSort, mergeSort, quickSort, radixSort } from "./sortingHelpers";

type AlgorithmKey = "quickSort" | "mergeSort" | "radixSort" | "insertionSort";
type DatasetSize = 100 | 1000 | 10000;

type AlgorithmResult = {
  key: AlgorithmKey;
  label: string;
  timeMs: number;
  sorted: boolean;
};

type SizeResult = {
  size: DatasetSize;
  results: AlgorithmResult[];
};

const DATASET_SIZES: DatasetSize[] = [100, 1000, 10000];

const ALGORITHMS: Array<{
  key: AlgorithmKey;
  label: string;
  run: (data: number[]) => number[];
}> = [
  {
    key: "quickSort",
    label: "QuickSort",
    run: (data) => quickSort(data, (a: number, b: number) => a - b),
  },
  {
    key: "mergeSort",
    label: "MergeSort",
    run: (data) => mergeSort(data, (a: number, b: number) => a - b),
  },
  {
    key: "radixSort",
    label: "RadixSort",
    run: (data) => radixSort(data),
  },
  {
    key: "insertionSort",
    label: "InsertionSort",
    run: (data) => insertionSort(data, (a: number, b: number) => a - b),
  },
];

function createSeededRandom(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDataset(size: number, seed: number) {
  const random = createSeededRandom(seed);
  return Array.from({ length: size }, () => {
    const value = Math.floor(random() * 200000);
    return random() > 0.5 ? value : -value;
  });
}

function isSorted(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > values[i]) {
      return false;
    }
  }
  return true;
}

function formatMs(value: number) {
  return `${value.toFixed(3)} ms`;
}

function BenchmarkBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const width = max === 0 ? 0 : Math.max(6, (value / max) * 100);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span className="font-medium">{label}</span>
        <span>{formatMs(value)}</span>
      </div>
      <div className="h-4 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function BenchmarkPage() {
  const [results, setResults] = useState<SizeResult[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);

    const output: SizeResult[] = [];

    for (const size of DATASET_SIZES) {
      const input = generateDataset(size, 2026 + size);

      const sizeResults: AlgorithmResult[] = ALGORITHMS.map((algorithm) => {
        const dataCopy = [...input];
        const start = performance.now();
        const sorted = algorithm.run(dataCopy);
        const end = performance.now();

        return {
          key: algorithm.key,
          label: algorithm.label,
          timeMs: Number((end - start).toFixed(3)),
          sorted: isSorted(sorted),
        };
      });

      output.push({ size, results: sizeResults });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setResults(output);
    setLastRunAt(new Date().toLocaleString("pt-BR"));
    setRunning(false);
  };

  useEffect(() => {
    void runBenchmark();
  }, []);

  const fastestBySize = useMemo(() => {
    return results.map((group) => {
      const fastest = [...group.results].sort((a, b) => a.timeMs - b.timeMs)[0];
      return { size: group.size, fastest };
    });
  }, [results]);

  return (
    <main className="min-h-screen bg-[#050036] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Comparação entre QuickSort, MergeSort, RadixSort e InsertionSort
              </h1>
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Esta página gera conjuntos de dados com <strong>100</strong>, <strong>1000</strong> e <strong>10000</strong> itens, executa cada algoritmo sobre a mesma entrada e mostra o tempo gasto em milissegundos. O gráfico ajuda a enxergar rapidamente qual algoritmo tende a escalar melhor em cada cenário.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void runBenchmark()}
              disabled={running}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {running ? "Executando..." : "Executar novamente"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Tamanho dos testes</p>
              <p className="mt-2 text-2xl font-semibold">100 / 1000 / 10000</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Algoritmos</p>
              <p className="mt-2 text-2xl font-semibold">4 comparações</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-wider text-slate-400">Última execução</p>
              <p className="mt-2 text-lg font-semibold">{lastRunAt ?? "Aguardando"}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 xl:col-span-2">
            <h2 className="text-2xl font-semibold">Resultados por tamanho</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Barras maiores significam mais tempo de execução.
            </p>

            <div className="mt-8 space-y-8">
              {results.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-slate-300">
                  Gerando os resultados do benchmark...
                </p>
              ) : (
                results.map((group) => {
                  const max = Math.max(...group.results.map((item) => item.timeMs));
                  const fastest = fastestBySize.find((item) => item.size === group.size)?.fastest;

                  return (
                    <section key={group.size} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-xl font-semibold">{group.size} itens</h3>
                        {fastest ? (
                          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                            Mais rápido: {fastest.label}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 grid gap-4">
                        {group.results.map((item) => {
                          const toneMap: Record<AlgorithmKey, string> = {
                            quickSort: "bg-gradient-to-r from-cyan-400 to-sky-500",
                            mergeSort: "bg-gradient-to-r from-violet-400 to-fuchsia-500",
                            radixSort: "bg-gradient-to-r from-amber-300 to-orange-500",
                            insertionSort: "bg-gradient-to-r from-rose-400 to-red-500",
                          };

                          return (
                            <BenchmarkBar
                              key={item.key}
                              label={item.label}
                              value={item.timeMs}
                              max={max}
                              tone={toneMap[item.key]}
                            />
                          );
                        })}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                        {group.results.map((item) => (
                          <div key={`${group.size}-${item.key}`} className="rounded-xl bg-slate-900/70 px-4 py-3">
                            <div className="font-medium text-slate-100">{item.label}</div>
                            <div>{formatMs(item.timeMs)}</div>
                            <div className={item.sorted ? "text-emerald-300" : "text-rose-300"}>
                              {item.sorted ? "Ordenado corretamente" : "Falha na ordenação"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </article>

          <aside className="space-y-6">

          </aside>
        </div>
      </section>
    </main>
  );
}