// src/types/jsx.d.ts

declare namespace JSX {
    interface IntrinsicElements {
        'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id'?: string }, HTMLElement>;
    }
}
