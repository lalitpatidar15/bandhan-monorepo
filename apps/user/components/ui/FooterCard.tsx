import Card from './Card';

type Props = {
  title: string;
  links: string[];
};

export default function FooterCard({ title, links }: Props) {
  return (
    <Card>
      <h3 className="text-[var(--bhn-text)] font-semibold mb-4">{title}</h3>

      <ul className="space-y-3 text-[var(--bhn-text)] text-sm">
        {links.map((link, i) => (
          <li key={i} className="hover:text-[var(--bhn-text)] cursor-pointer transition">
            {link}
          </li>
        ))}
      </ul>
    </Card>
  );
}