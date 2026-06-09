import React, { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import Trie from "../../utils/trie";

interface Sugestao {
  nome: string;
  departamento: string;
}

interface BarraPesProps {
  onSearch: (searchTerm: string, modo: "nome" | "departamento") => void;
  sugestoes: Sugestao[];
}

const BarraPes: React.FC<BarraPesProps> = ({ onSearch, sugestoes }) => {
  const [search, setSearch] = React.useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = React.useState(true);
  const [modoBusca, setModoBusca] = React.useState<"nome" | "departamento">("nome");

  const nameTrie = useMemo(() => {
    const trie = new Trie();
    sugestoes.forEach((sugestao, index) => {
      trie.insert(sugestao.nome, {
        id: index,
        nome: sugestao.nome,
        departamento: sugestao.departamento,
      });
    });
    return trie;
  }, [sugestoes]);

  const deptTrie = useMemo(() => {
    const trie = new Trie();
    sugestoes.forEach((sugestao, index) => {
      trie.insert(sugestao.departamento, {
        id: index,
        nome: sugestao.nome,
        departamento: sugestao.departamento,
      });
    });
    return trie;
  }, [sugestoes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value, modoBusca);
    setMostrarSugestoes(true);
  };

  const handleClickSugestao = (sugestao: Sugestao) => {
    const value = modoBusca === "nome" ? sugestao.nome : sugestao.departamento;
    setSearch(value);
    onSearch(value, modoBusca);
    setMostrarSugestoes(false);
  };

  const sugestoesFiltradas = search === ""
    ? []
    : (modoBusca === "nome"
      ? nameTrie.searchPrefix(search, 8)
      : deptTrie.searchPrefix(search, 8));

  return (
    <div className="w-full max-w-md px-4 py-5 text-left">
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setModoBusca("nome")}
          className={`px-3 py-1 rounded-full text-sm ${modoBusca === "nome" ? "bg-[#050036] text-white" : "bg-gray-200"}`}
        >
          Nome
        </button>
        <button
          type="button"
          onClick={() => setModoBusca("departamento")}
          className={`px-3 py-1 rounded-full text-sm ${modoBusca === "departamento" ? "bg-[#050036] text-white" : "bg-gray-200"}`}
        >
          Departamento
        </button>
      </div>

      <div className="relative w-full">
        <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
        <input
          type="search"
          value={search}
          onChange={handleChange}
          placeholder={`Buscar professor(a) por ${modoBusca}`}
          className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 rounded-xl bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#050036]"
        />
        {mostrarSugestoes && sugestoesFiltradas.length > 0 && (
          <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-md max-h-60 overflow-y-auto">
            {sugestoesFiltradas.map((s) => (
              <li
                key={`${s.id}-${modoBusca}`}
                onClick={() => handleClickSugestao(s)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {modoBusca === "nome" ? s.nome : s.departamento}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BarraPes;
