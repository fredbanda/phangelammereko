import Link from 'next/link';
import WhatsApp from '../../../public/whatsapp.png';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <div className="bg-gray-700 py-4 text-gray-100  left-0 right-0 ">
        <div className="container mx-auto px-4 ">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <div className="mb-2 sm:mb-0 text-center sm:text-left">
              Copyright © {currentYear}. All Rights Reserved.
            </div>

            <Link href="https://wa.me/27814402910" className="mb-2 sm:mb-0">
              <Image
                src={WhatsApp}
                alt="WhatsApp"
                className="w-10 h-10 mx-auto sm:mx-0"
              />
            </Link>

            <div className="text-center sm:text-left">
              Made with ❤️ by{' '}
              <Link href="mailto:ndabegeba@gmail.com">
                Eunny Tech. Email me for your projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
