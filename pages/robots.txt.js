export async function getServerSideProps({ req, res }) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const response = await fetch(`${baseUrl}${apiUrl}/user/space-meta`);
    if (response.ok) {
      const json = await response.json();
      const data = json.data;
      if (data.robots_txt) {
        res.setHeader("Content-Type", "text/plain");
        res.write(data.robots_txt);
        res.end();
        return { props: {} };
      }
    }
    res.statusCode = 404;
    res.end("Not found");
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
  return { props: {} };
}
 
export default function Robots() {
  // This component never renders because getServerSideProps handles the response
  return null;
}