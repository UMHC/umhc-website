import Link from 'next/link';

interface TextContent {
  type: 'text';
  text: string;
}

interface ListContent {
  type: 'list';
  items: (string | ContentBlock[])[];
}

interface LinkContent {
  type: 'link';
  text: string;
  href: string;
}

type ContentBlock = TextContent | ListContent | LinkContent;

interface StructuredAnswer {
  type: 'structured';
  content: ContentBlock[];
}

interface ContentRendererProps {
  answer: StructuredAnswer;
}

export default function ContentRenderer({ answer }: ContentRendererProps) {
  // Handle cases where answer or content might be undefined
  if (!answer || !answer.content || !Array.isArray(answer.content)) {
    return (
      <p className="text-xs sm:text-sm md:text-base text-slate-grey font-sans leading-relaxed">
        Content unavailable
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {answer.content.map((block, index) => {
        switch (block.type) {
          case 'text':
            return (
              <span key={index} className="text-xs sm:text-sm md:text-base text-slate-grey font-sans leading-relaxed">
                {block.text}
              </span>
            );
          
          case 'list':
            return (
              <ul key={index} className="list-disc list-outside space-y-1 text-xs sm:text-sm md:text-base text-slate-grey font-sans leading-relaxed ml-6 pl-2">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {typeof item === 'string' ? (
                      item
                    ) : (
                      <span className="inline-flex flex-wrap items-baseline gap-0">
                        {item.map((subBlock, subIndex) => {
                          switch (subBlock.type) {
                            case 'text':
                              return (
                                <span key={subIndex}>
                                  {subBlock.text}
                                </span>
                              );
                            case 'link':
                              return (
                                <Link 
                                  key={subIndex} 
                                  href={subBlock.href!}
                                  className="text-umhc-green hover:underline focus:outline-none focus:underline"
                                >
                                  {subBlock.text}
                                </Link>
                              );
                            default:
                              return null;
                          }
                        })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            );
          
          case 'link':
            return (
              <Link 
                key={index} 
                href={block.href}
                className="text-xs sm:text-sm md:text-base text-umhc-green font-sans leading-relaxed hover:underline focus:outline-none focus:underline"
              >
                {block.text}
              </Link>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}