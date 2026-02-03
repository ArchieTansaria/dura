import { InteractiveSelector } from './InteractiveSelector';

export function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 md:pt-32 md:pb-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl mt-10 font-bold tracking-tight text-primary mb-6">
          Analyze dependency update risk <br className="hidden md:block"/>
          before it breaks prod.
        </h1>
        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-12">
          Understanding breaking changes shouldn't be a guessing game. 
          Run deep analysis across your entire dependency tree.
        </p>
        
        <InteractiveSelector />
      </div>
    </section>
  );
}
