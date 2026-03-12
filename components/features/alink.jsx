import Link from "next/link";

export default function ALink ( { children, className, style, href, ...props } ) {
    function defaultFunction ( e ) {
        if ( href == '#' ) {
            e.preventDefault();
        }
    }

    return (
        <Link href={href} className={ className } style={ style } onClick={ defaultFunction } {...props}>
            { children }
        </Link>
    )
}
