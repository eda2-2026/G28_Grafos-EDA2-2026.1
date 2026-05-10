"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./components/navbar/NavBar";
import CarrosselProfessores from "./components/carrossel/carrossel";
import DropdownOrdenar from "./components/ordenar/ordenar";
import BarraPes from "./components/pesquisa/pesquisa";
import ProfQuadro from "./components/quadro/Quadro";
import { Footer } from "./components/footer/footer";
import { getAllProf } from "./utils/api";
import Link from "next/link";

const Home = () => {
  type Professor = {
    id: number;
    nome: string;
    materia: string;
    departamento: string;
    fotosrc: string;
  };

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [ordenacao, setOrdenacao] = useState<'nome' | 'departamento' | 'recentes' | 'antigas'>('recentes');
  const [filtro, setFiltro] = useState<Professor[]>([]);
  
  const fetchProfessores = async () => {
    console.log("Página Home: A função fetchProfessores foi chamada!");
    try {
      const data = await getAllProf();
      setProfessores(data);
      setFiltro(data); 
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  useEffect(() => {
    console.log("Página Home: Configurando o 'ouvinte' para o evento professorCreated.");
    fetchProfessores();
    window.addEventListener('professorCreated', fetchProfessores);

    return () => {
      window.removeEventListener('professorCreated', fetchProfessores);
    };
  }, []);

  const professoresRecentes = professores.slice(-8);

  const professoresOrdenados = [...professores].sort((a, b) => {
    if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
    if (ordenacao === "departamento") return a.departamento.localeCompare(b.departamento);
    if (ordenacao === "antigas") return 0;
    if (ordenacao === "recentes") return -1;
    return 0;
  });

  const handleSearch = (searchTerm: string, modo: "nome" | "departamento") => {
    if (searchTerm === "") {
      setFiltro(professores);
      return;
    }

    const filtrados = professores.filter((p) =>
      modo === "nome"
        ? p.nome.toLowerCase().startsWith(searchTerm.toLowerCase())
        : p.departamento.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFiltro(filtrados);
  };

  return (
    <>
      

      <div className="flex justify-end px-10 pr-23 mt-4">
        <BarraPes
          onSearch={handleSearch}
          sugestoes={professores.map((p) => ({
            nome: p.nome,
            departamento: p.departamento,
          }))}
        />
      </div>

      {/* Exibir professores filtrados se o usuário estiver buscando */}
      {filtro.length < professores.length ? (
        <section className="px-10 py-6">
          <h2 className="text-3xl font-medium ml-4">Resultado da Pesquisa</h2>
          {filtro.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {filtro.map((prof) => (
                <Link href={`/perfilDeProfessor?id=${prof.id}`} key={prof.id}>
                  <ProfQuadro
                    id={prof.id}
                    nome={prof.nome}
                    materia={prof.materia}
                    departamento={prof.departamento}
                    fotosrc={prof.fotosrc}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-medium text-gray-500 mt-4 ml-4">Nenhum professor encontrado.</p>
          )}
        </section>
      ) : (
        <>
          {/* Carrossel - Novos Professores */}
          <section className="px-4 sm:px-8 md:px-10 lg:px-15 py-10">
            <h2 className="text-3xl font-medium ml-4 sm:ml-8 md:ml-10">Novos Professores</h2>
            <CarrosselProfessores professores={professoresRecentes} />
          </section>

          {/* Carrossel - Todos os Professores com ordenação */}
          <section className="px-4 sm:px-8 md:px-10 lg:px-15 py-10">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-3xl font-medium ml-4 sm:ml-8 md:ml-10">Todos os Professores</h2>
              <DropdownOrdenar ordenacao={ordenacao} setOrdenacao={setOrdenacao} />
            </div>
            <CarrosselProfessores professores={professoresOrdenados} />
          </section>
        </>
      )}

      <Footer></Footer>
    </>
  );
};

export default Home;
