export function Footer() {
  return (
    <footer id="footer" className="py-12 border-t border-subtle/30 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-secondary text-sm">
          © {new Date().getFullYear()} dura. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6">
          <a href="https://github.com/ArchieTansaria/dura#readme" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">Documentation</a>
          <a href="https://github.com/ArchieTansaria/dura" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">GitHub</a>
          <a href="https://x.com/archietansaria" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
