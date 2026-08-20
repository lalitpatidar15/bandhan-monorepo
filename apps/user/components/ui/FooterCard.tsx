import Card from './Card';

type Props = {
  title: string;
  links: string[];
};

export default function FooterCard({ title, links }: Props) {
  return (
    <Card>
      <h3 className="text-[#9C4A2F] font-semibold mb-4">{title}</h3>

      <ul className="space-y-3 text-gray-600 text-sm">
        {links.map((link, i) => (
          <li key={i} className="hover:text-[#9C4A2F] cursor-pointer transition">
            {link}
          </li>
        ))}
      </ul>
    </Card>
  );
}