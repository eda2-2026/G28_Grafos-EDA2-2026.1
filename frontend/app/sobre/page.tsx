"use client";
import React from "react";
import { FaPaintBrush, FaRocket, FaLightbulb, FaGem } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="bg-[#EDEDED] text-gray-800 font-sans">
      <section
        className="relative flex flex-col items-center justify-center text-center py-32 px-4 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/fotoEquipe/fotoEquipe.jpeg')" }}
      >
        <div className="absolute inset-0 bg-[#050036]/60"></div>
        <div className="relative z-10">
          <img
            src="../logo/Logomarca 3.svg"
            alt="Logo Fui Com a Cara"
            className="max-w-xs md:max-w-sm lg:max-w-md h-auto"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto py-16 px-6">
        <ServiceCard
          icon={<FaPaintBrush />}
          title="Identidade Visual"
          text="Nossa identidade visual é única, aproximando o usuário da marca."
        />
        <ServiceCard
          icon={<FaLightbulb />}
          title="Inovação"
          text="Criamos uma plataforma intuitiva para que os usuários avaliem professores facilmente."
        />
        <ServiceCard
          icon={<FaRocket />}
          title="Trabalho Estratégico"
          text="Dividimos tarefas de forma estratégica para evoluir o site continuamente."
        />
        <ServiceCard
          icon={<FaGem />}
          title="Hard Skills"
          text="Aproveitamos o projeto para aprimorar nossas habilidades técnicas."
        />
      </section>

      <section className="bg-[#EDEDED] py-10 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#050036]">Sobre o Site</h2>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="../logo/jacareCarrossel.png"
              alt="Jacaré Carrossel"
              className="max-w-xs md:max-w-sm lg:max-w-md h-auto"
            />
          </div>
          <div className="w-full md:w-1/2">
            <AboutCard
              title="Uma plataforma feita para você"
              text="O Fui Com a Cara nasceu com o objetivo de oferecer aos alunos um espaço seguro e transparente para avaliar professores e compartilhar suas experiências. Nossa missão é ajudar estudantes a tomar decisões mais conscientes e também dar um retorno construtivo para os docentes."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#EDEDED] py-10 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#050036]">Nossa História</h2>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-1/2">
            <AboutCard
              title="Um pouco de nós"
              text="O projeto foi feito no processo trainee da empresa júnior de Ciência da Computação da Universidade de Brasília: CJR. Durante esse processo, tivemos a oportunidade de aprender na prática, desenvolvendo desde o planejamento até a implementação final do site. Trabalhamos em equipe, enfrentando desafios reais e evoluindo nossas habilidades técnicas e de colaboração.
              Cada linha de código e cada decisão de design foram construídas com muito cuidado, buscando criar um site visualmente acolhedor e de fácil utilização. Para nós, este site não é apenas um produto final, mas também um símbolo de aprendizado, crescimento e dedicação."
            />
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="../logo/jacareGamer.png"
              alt="Jacaré Gamer"
              className="max-w-xs md:max-w-sm lg:max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#050036] py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-white">Sobre os Desenvolvedores</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <DevCard
            image="../fotoEquipe/joaoMoreira.jpeg"
            name="João Moreira"
            text="Desenvolvedor Full Stack apaixonado por criar soluções eficientes. Cuida do backend e integrações."
            githubUrl="https://github.com/joaofmoreiraa" 
          />
          <DevCard
            image="../fotoEquipe/johnnSalles.jpeg"
            name="Johnnatan Salles"
            text="Especialista em frontend e design, criando experiências visuais únicas para os usuários."
            githubUrl="https://github.com/jsalless" 
          />
          <DevCard
            image="../fotoEquipe/pedroIan.jpeg"
            name="Pedro Ian"
            text="Responsável pela infraestrutura, banco de dados e segurança do sistema."
            githubUrl="https://github.com/pedroiaan" 
          />
          <DevCard
            image="../fotoEquipe/heyttorAugusto.jpeg"
            name="Heyttor Augusto"
            text="Focada em UX/UI, garantindo que o site seja acessível, intuitivo e atrativo para todos."
            githubUrl="https://github.com/H3ytt0r62" 
          />
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, text }) {
  return (
    <div className="bg-[#1a1a33] p-6 rounded-lg text-center hover:bg-[#050036] hover:text-white transition-colors duration-300">
      <div className="text-3xl mb-4 text-white">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-400 mt-2 text-sm">{text}</p>
    </div>
  );
}

function AboutCard({ title, text }) {
  return (
    <div className="bg-[#f0e6c7] p-8 rounded-xl text-left shadow-lg text-[#050036]">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-lg leading-relaxed">{text}</p>
    </div>
  );
}

function DevCard({ image, name, text, githubUrl }) {
  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#1a1a33] rounded-lg overflow-hidden hover:bg-[#394668] hover:text-white transition-colors duration-300 block" // Added 'block' to make the whole card clickable
    >
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-6 text-left">
        <h3 className="text-xl font-semibold mb-2 text-white">{name}</h3>
        <p className="text-gray-400 text-sm">{text}</p>
      </div>
    </a>
  );
}