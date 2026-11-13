import React from 'react';

export function Footer() {
  return (
    <footer className="bg-base-300 mt-auto py-6 text-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-base-content text-base leading-relaxed font-medium">
          Hat, Coat &amp; Boots
        </p>
        <p className="text-base-content/80 mt-1 text-sm leading-relaxed">
          An interactive book about how buildings work.
        </p>
        <p className="text-base-content/80 mt-1 text-sm">
          Built with{' '}
          <a
            href="https://github.com/TortoiseWolfe/ScriptHammer"
            target="_blank"
            rel="noopener noreferrer"
            className="link-hover link inline-block min-h-11 align-middle leading-11"
          >
            ScriptHammer
          </a>
        </p>
      </div>
    </footer>
  );
}
