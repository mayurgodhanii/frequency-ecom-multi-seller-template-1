import { useRouter } from 'next/router';
import ALink from '~/components/features/alink';
import React, { useState, useEffect } from 'react';
import DynamicComponent from '~/components/DynamicComponent';

function Footer_second({ footerContent, logo }) {
    const router = useRouter();
    const [isBottomSticky, setIsBottomSticky] = useState(false);
    const [containerClass, setContainerClass] = useState('container');

    useEffect(() => {
        handleBottomSticky();
        setContainerClass(router.asPath.includes('fullwidth') ? 'container-fluid' : 'container');
    }, [router.asPath]);

    useEffect(() => {
        window.addEventListener('resize', handleBottomSticky, { passive: true });
        return () => {
            window.removeEventListener('resize', handleBottomSticky);
        };
    }, []);

    function handleBottomSticky() {
        setIsBottomSticky(router.pathname.includes('product/default') && window.innerWidth > 991);
    }

    const footerSection = footerContent?.component;
    const footerId = footerSection?.options?.id || "footer";
    const contents = Array.isArray(footerSection?.options?.contents) ? footerSection.options.contents : [];



    // Track used IDs
    const usedIds = new Set(
        contents
            .filter((content) => ['Copyright', 'Social Media'].includes(content.component?.name))
            .map((content) => content.component?.options?.id)
            .filter((id) => id)
    );

    // Filter dynamic components
    const dynamicComponents = contents.filter(
        (content) => !usedIds.has(content.component?.options?.id)
    );



    return (
        <div className='footer_second'>
        <footer className="footer" id={footerId}>
            {
                router.pathname !== '/' &&
                <div className={containerClass}>
                    <hr className="m-0" />
                </div>
            }

            <div className="footer-bottom" id={`${footerId}-bottom`}>
                <div className={containerClass} id={`${footerId}-container`}>
                    {contents.map((content, index) => {
                        const component = content.component;
                        const outerId = component.options?.id || '';
                        const inner = component.components?.[0];

                        switch (component.name) {
                            case 'Copyright':
                                return (
                                    <p key={index} className="footer-copyright" id={outerId}>
                                        <span id={inner?.options?.id || ''}>
                                            {inner?.options?.text || '© 2025 Molla Store. All Rights Reserved.'}
                                        </span>
                                    </p>
                                );

                            case 'Social Media':
                                return (
                                    <div key={index} className="social-icons social-icons-color" id={outerId}>
                                        {
                                            inner?.name === 'socialLinks' && inner.options &&
                                            Object.keys(inner.options).filter(key => key !== 'id').map((social, i) => (
                                                <a
                                                    key={i}
                                                    href={inner.options[social]}
                                                    className={`social-icon social-${social}`}
                                                    title={social.charAt(0).toUpperCase() + social.slice(1)}
                                                    id={`id_${social}_icon_${outerId}`}
                                                    onClick={e => e.preventDefault()}
                                                >
                                                    <i className={`icon-${social}`}></i>
                                                </a>
                                            ))
                                        }
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}
                    {/* Render dynamic components */}
                    {/* {dynamicComponents.length > 0 && (
                        <div className="dynamic-components" id={`${footerId}-dynamic`}>
                            {dynamicComponents.map((content, idx) => (
                                <DynamicComponent
                                    key={content.component?.options?.id || `dynamic-${idx}`}
                                    component={content.component}
                                />
                            ))}
                        </div>
                    )} */}
                </div>
            </div>

            {isBottomSticky && <div className="mb-10" id={`${footerId}-sticky`}></div>}
        </footer>
        </div>
    );
}

export default React.memo(Footer_second);



// import { useRouter } from 'next/router';
// import ALink from '~/components/features/alink';
// import React, { useState, useEffect } from 'react';

// function Footer({ footerContent, logo }) {
//     const router = useRouter();
//     const [isBottomSticky, setIsBottomSticky] = useState(false);
//     const [containerClass, setContainerClass] = useState('container');

//     useEffect(() => {
//         handleBottomSticky();
//         setContainerClass(router.asPath.includes('fullwidth') ? 'container-fluid' : 'container');
//     }, [router.asPath]);

//     useEffect(() => {
//         window.addEventListener('resize', handleBottomSticky, { passive: true });
//         return () => {
//             window.removeEventListener('resize', handleBottomSticky);
//         };
//     }, []);

//     function handleBottomSticky() {
//         setIsBottomSticky(router.pathname.includes('product/default') && window.innerWidth > 991);
//     }

//     const footerSection = footerContent?.component;
//     const footerId = footerSection?.options?.id || "footer";

//     return (
//         <footer className="footer" id={footerId}>
//             {
//                 router.pathname !== '/' &&
//                 <div className={containerClass}>
//                     <hr className="m-0" />
//                 </div>
//             }

//             <div className="footer-bottom">
//                 <div className={containerClass}>
//                     {footerSection?.options?.contents?.map((content, index) => {
//                         const component = content.component;
//                         const outerId = component.options?.id || '';
//                         const inner = component.components?.[0];

//                         switch (component.name) {
//                             case 'Copyright':
//                                 return (
//                                     <p key={index} className="footer-copyright" id={outerId}>
//                                         <span id={inner?.options?.id || ''}>
//                                             {inner?.options?.text || '© 2025 Molla Store. All Rights Reserved.'}
//                                         </span>
//                                     </p>
//                                 );

//                             case 'Social Media':
//                                 return (
//                                     <div key={index} className="social-icons social-icons-color" id={outerId}>
//                                         {
//                                             inner?.name === 'socialLinks' && inner.options &&
//                                             Object.keys(inner.options).filter(key => key !== 'id').map((social, i) => (
//                                                 <a
//                                                     key={i}
//                                                     href={inner.options[social]}
//                                                     className={`social-icon social-${social}`}
//                                                     title={social.charAt(0).toUpperCase() + social.slice(1)}
//                                                     id={`id_${social}_icon`}
//                                                     onClick={e => e.preventDefault()}
//                                                 >
//                                                     <i className={`icon-${social}`}></i>
//                                                 </a>
//                                             ))
//                                         }
//                                     </div>
//                                 );

//                             default:
//                                 return null;
//                         }
//                     })}
//                 </div>
//             </div>

//             {isBottomSticky && <div className="mb-10"></div>}
//         </footer>
//     );
// }

// export default React.memo(Footer);
