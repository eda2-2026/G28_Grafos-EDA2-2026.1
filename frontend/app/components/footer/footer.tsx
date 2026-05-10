import React from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; 

export const Footer: React.FC = () => {
    const router = useRouter();

    return (
        <footer className='bg-[#050036] text-white py-6 mt-10'>
            <div className='flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 md:px-0'>
                <button
                    aria-label="Home"
                    className="p-1 rounded-full cursor-pointer mb-4 md:mb-0"
                    onClick={() => router.push('/')}
                >
                    <img src="/logo/Logomarca 3.svg" alt="Logo" className="h-16" />
                </button>

                <div className='flex flex-col items-center text-center py-4 text-white'>
                    <div className='flex space-x-8 mb-2'>
                        <button
                            onClick={() => router.push('/contato')}
                            className='text-lg hover:scale-110 transform transition-transform duration-200 focus:outline-none'
                        >
                            Contato
                        </button>

                        <button
                            onClick={() => router.push('/sobre')}
                            className='text-lg hover:scale-110 transform transition-transform duration-200 focus:outline-none'
                        >
                            Sobre
                        </button>
                    </div>
                    <p className="text-sm">
                        @2025 Fui com a cara todos os direitos reservados
                    </p>
                </div>

                <div className='flex space-x-4 mt-4 md:mt-0'>
                    <a href="https://www.instagram.com/fuicomacara/" target="_blank" rel="noopener noreferrer">
                        <FaInstagram size={30} className='text-white hover:scale-110 transform transition-transform duration-200' />
                    </a>
                    <a href="https://www.linkedin.com/in/fui-com-a-cara-undefined-b0988b374/" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin size={30} className='text-white hover:scale-110 transform transition-transform duration-200' />
                    </a>
                </div>
            </div>
        </footer>
    );
};