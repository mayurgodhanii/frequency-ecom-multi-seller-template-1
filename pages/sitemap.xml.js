export async function getServerSideProps({ req, res }) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const response = await fetch(`${baseUrl}${apiUrl}/user/space-meta`);
    if (response.ok) {
      const json = await response.json();
      const data = json.data;
      if (data.sitemap_xml) {
        res.setHeader("Content-Type", "application/xml");
        res.write(data.sitemap_xml);
        res.end();
        return { props: {} };
      }
    }
    res.statusCode = 404;
    res.end("<error>Not found</error>");
  } catch (error) {
    res.statusCode = 500;
    res.end("<error>Internal Server Error</error>");
  }
  return { props: {} };
}

export default function Sitemap() {
  // This component never renders because getServerSideProps handles the response
  return null;
}
