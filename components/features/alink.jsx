import Link from "next/link";

export default function ALink ( { children, className, style, href, ...props } ) {
    function defaultFunction ( e ) {
        if ( href == '#' || !href ) {
            e.preventDefault();
        }
    }

    // Provide a fallback href if undefined
    const safeHref = href || '#';

    return (
        <Link href={safeHref} className={ className } style={ style } onClick={ defaultFunction } {...props}>
            { children }
        </Link>
    )
}
