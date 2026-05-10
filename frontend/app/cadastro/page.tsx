'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Botão from '../components/botao_azul/Botao_Azul';
import Popup from '../components/popup/PopUp';
import { registerUser } from '../utils/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PopUp from '../components/popup/PopUp';

export default function CadastroPage() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState('');
  const [departamento, setDepartamento] = useState('');

  const [erroNome, setErroNome] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmarSenha, setErroConfirmarSenha] = useState('');
  const [erroCampos, setErroCampos] = useState('');

  const [popupAberto, setPopupAberto] = useState(false);
  const router = useRouter();

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);

  const lendoRegister = async () => {
    try {
      await registerUser(nome, email, senha, curso, departamento);
      setPopupAberto(true);

      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  };

  const validarSenhaSegura = (senha: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  const validarNome = (nome: string) => {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    return regex.test(nome.trim());
  };

  const validarEmail = (email: string) => {
    const regexFormato = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexFormato.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErroNome('');
    setErroEmail('');
    setErroSenha('');
    setErroConfirmarSenha('');
    setErroCampos('');

    if (!nome || !email || !curso || !departamento || !senha || !confirmarSenha) {
      setErroCampos('Por favor, preencha todos os campos.');
      return;
    }

    if (!validarNome(nome)) {
      setErroNome('O nome deve conter apenas letras e espaços.');
      return;
    }

    if (!validarEmail(email)) {
      setErroEmail('Por favor, insira um email válido.');
      return;
    }

    if (!validarSenhaSegura(senha)) {
      setErroSenha('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErroConfirmarSenha('As senhas não coincidem.');
      return;
    }

    await lendoRegister();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 bg-yellow-100 flex justify-center items-center">
        <img
          src="logo/jacareCadastro.png"
          alt="Jacaré Cadastro"
          className='w-[90%] h-full object-contain'
        />
      </div>

      <div className="w-full md:w-1/2 bg-[#EDEDED] flex flex-col justify-center items-center p-8">
        <img
          src="logo/Logomarca 2.svg"
          alt="Logo"
          className='w-100 mb-6'
        />

        <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700"
          />
          {erroNome && <p className="text-red-500 text-sm mt-1">{erroNome}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700"
          />
          {erroEmail && <p className="text-red-500 text-sm mt-1">{erroEmail}</p>}

          <div className="relative">
            <input
              type={senhaVisivel ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setSenhaVisivel(!senhaVisivel)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {senhaVisivel ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {erroSenha && <p className="text-red-500 text-sm mt-1">{erroSenha}</p>}

          <div className="relative">
            <input
              type={confirmarSenhaVisivel ? "text" : "password"}
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {confirmarSenhaVisivel ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {erroConfirmarSenha && <p className="text-red-500 text-sm mt-1">{erroConfirmarSenha}</p>}

          <input
            type="text"
            placeholder="Curso"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700"
          />

          <input
            type="text"
            placeholder="Departamento"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="h-12 w-full p-2 bg-white rounded-xl placeholder-gray-500 text-gray-700"
          />

          {erroCampos && <p className="text-red-500 text-sm mt-1">{erroCampos}</p>}

          <PopUp 
          isOpen={popupAberto}
          title="Cadastro realizado com sucesso!"
          description="Redirecionando para o login..."
          />

          <div className="w-full flex justify-center mt-8 space-x-20">
            <Botão type="submit">Cadastrar</Botão>
          </div>
          
          <div className="text-center text-[#050036] text-sm font-medium">
              Já possui uma conta?
              <a href="/login" className="login-link font-semibold hover:underline"> Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
