import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full bg-black text-white">
      <div className="content-container flex flex-col w-full px-6 py-16 md:px-12 md:py-20 lg:py-24 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-24">
          
          {/* Brand Column */}
          <div className="flex flex-col max-w-sm">
            <LocalizedClientLink
              href="/"
              className="text-2xl font-black uppercase tracking-[0.25em] mb-6 inline-block hover:opacity-80 transition-opacity"
            >
              EME SPORTWEAR
            </LocalizedClientLink>
            <p className="text-[#888888] text-sm font-light leading-relaxed mb-10">
              Ropa deportiva de alto rendimiento diseñada para moverse contigo. Supera tus límites con estilo.
            </p>
            
            <div className="flex flex-col gap-8">
              {/* Socials */}
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/emesportwear"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264.583 264.583" className="w-7 h-7">
                    <defs>
                      <radialGradient xlinkHref="#instagram_icon__a" id="instagram_icon__f" cx="158.429" cy="578.088" r="52.352" fx="158.429" fy="578.088" gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.227 942.236)" gradientUnits="userSpaceOnUse"/>
                      <radialGradient xlinkHref="#instagram_icon__b" id="instagram_icon__g" cx="172.615" cy="600.692" r="65" fx="172.615" fy="600.692" gradientTransform="matrix(.67441 -1.16203 1.51283 .87801 -814.366 -47.835)" gradientUnits="userSpaceOnUse"/>
                      <radialGradient xlinkHref="#instagram_icon__c" id="instagram_icon__h" cx="144.012" cy="51.337" r="67.081" fx="144.012" fy="51.337" gradientTransform="matrix(-2.3989 .67549 -.23008 -.81732 464.996 -26.404)" gradientUnits="userSpaceOnUse"/>
                      <radialGradient xlinkHref="#instagram_icon__d" id="instagram_icon__e" cx="199.788" cy="628.438" r="52.352" fx="199.788" fy="628.438" gradientTransform="matrix(-3.10797 .87652 -.6315 -2.23914 1345.65 1374.198)" gradientUnits="userSpaceOnUse"/>
                      <linearGradient id="instagram_icon__d"><stop offset="0" stopColor="#ff005f"/><stop offset="1" stopColor="#fc01d8"/></linearGradient>
                      <linearGradient id="instagram_icon__c"><stop offset="0" stopColor="#780cff"/><stop offset="1" stopColor="#820bff" stopOpacity="0"/></linearGradient>
                      <linearGradient id="instagram_icon__b"><stop offset="0" stopColor="#fc0"/><stop offset="1" stopColor="#fc0" stopOpacity="0"/></linearGradient>
                      <linearGradient id="instagram_icon__a"><stop offset="0" stopColor="#fc0"/><stop offset=".124" stopColor="#fc0"/><stop offset=".567" stopColor="#fe4a05"/><stop offset=".694" stopColor="#ff0f3f"/><stop offset="1" stopColor="#fe0657" stopOpacity="0"/></linearGradient>
                    </defs>
                    <path fill="url(#instagram_icon__e)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/>
                    <path fill="url(#instagram_icon__f)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/>
                    <path fill="url(#instagram_icon__g)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/>
                    <path fill="url(#instagram_icon__h)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/>
                    <path fill="#fff" d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"/>
                  </svg>
                </a>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-3 opacity-30 saturate-0 hover:opacity-100 hover:saturate-100 transition-all duration-300">
                <svg width="32" height="20" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="25" rx="4" fill="white"/>
                  <path d="M18.8 8.41113L17.5 16.5889H14.8L16.1 8.41113H18.8ZM27.1 8.61113C26.5 8.41113 25.6 8.21113 24.6 8.21113C21.8 8.21113 19.9 9.71113 19.9 11.9111C19.9 13.5111 21.3 14.4111 22.4 14.9111C23.5 15.4111 23.9 15.8111 23.9 16.4111C23.9 17.3111 22.8 17.7111 21.8 17.7111C20.6 17.7111 19.9 17.4111 19.3 17.1111L18.9 16.9111L18.5 18.9111C19.1 19.2111 20.3 19.5111 21.6 19.5111C24.6 19.5111 26.5 18.0111 26.5 15.7111C26.5 13.0111 22.7 12.8111 22.7 11.5111C22.7 11.0111 23.2 10.4111 24.4 10.4111C25.4 10.4111 26.1 10.6111 26.6 10.8111L26.8 10.9111L27.1 8.61113ZM34.7 16.5889H37.3L34.9 8.41113H32.7C32.1 8.41113 31.7 8.71113 31.5 9.21113L26.9 16.5889H29.7L30.2 15.1889H33.7L34.1 16.5889H34.7ZM31.0 13.2889L32.4 9.41113L33.2 13.2889H31.0ZM13.8 8.41113L10.0 14.3111L9.6 12.4111C9.2 10.7111 7.2 8.61113 4.6 8.41113L4.7 8.71113C7.0 9.11113 9.0 10.2111 9.9 11.6111L11.5 16.5889H14.2L17.7 8.41113H15.0L13.8 8.41113Z" fill="#1434CB"/>
                </svg>
                <svg width="32" height="20" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="25" rx="4" fill="#252525"/>
                  <circle cx="15.5" cy="12.5" r="7" fill="#EB001B"/>
                  <circle cx="24.5" cy="12.5" r="7" fill="#F79E1B"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 17.8441C21.6846 16.6433 22.75 14.6985 22.75 12.5C22.75 10.3015 21.6846 8.3567 20 7.15588C18.3154 8.3567 17.25 10.3015 17.25 12.5C17.25 14.6985 18.3154 16.6433 20 17.8441Z" fill="#FF5F00"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-wrap gap-12 md:gap-24 lg:ml-auto">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#555555]">
                  Categorías
                </span>
                <ul className="flex flex-col gap-4">
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) return null;
                    return (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                          href={`/categories/${c.handle}`}
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#555555]">
                  Colecciones
                </span>
                <ul className="flex flex-col gap-4">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#555555]">
                Soporte
              </span>
              <ul className="flex flex-col gap-4">
                <li>
                  <LocalizedClientLink
                    href="/about"
                    className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    Acerca de nosotros
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms"
                    className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    Términos y condiciones
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/privacy"
                    className="text-sm text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    Política de privacidad
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center mt-24 pt-8 gap-6">
          <p className="text-[11px] text-[#555555] tracking-widest uppercase font-medium">
            © {new Date().getFullYear()} EME SPORTWEAR. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  )
}
