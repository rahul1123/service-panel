
import Layout from "@/components/Layout";
export default function ApiDocs() {
  return (
    <Layout>
      <div className="w-full h-full">
        <iframe
          src="https://gwsapi.amyntas.in/api-docs/"
          className="w-full h-[calc(100vh-100px)] border-0 rounded-md shadow-sm"
          title="API Documentation"
        ></iframe>
      </div>
    </Layout>
  );
}