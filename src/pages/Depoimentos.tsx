import { Layout } from "@/components/Layout";
import { Testimonials } from "@/components/Testimonials";

const Depoimentos = () => {
  return (
    <Layout>
      <section className="pt-16 pb-4 text-center container mx-auto px-4">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-primary text-balance">
          Depoimentos
        </h1>
        <p className="text-foreground/70 mt-4 max-w-xl mx-auto">
          Vozes de quem viveu — e foi transformado — pelas ações do Projeto Natureza.
        </p>
      </section>
      <Testimonials />
    </Layout>
  );
};

export default Depoimentos;
