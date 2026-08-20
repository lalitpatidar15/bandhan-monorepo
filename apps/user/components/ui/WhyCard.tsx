import Card from './Card';

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
}
export default function WhyCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <Card className="backdrop-blur-sm p-4 rounded-xl transition">
      <div className="flex items-start gap-3">
        
        {/* Icon */}
        <div className="text-[#9C4A2F] text-xl">
          {icon}
        </div>

        {/* Text */}
        <div>
          <h6 className="font-semibold text-[13px] mb-1">{title}</h6>
          <p className="text-gray-600 text-[12px] leading-relaxed">
            {desc}
          </p>
        </div>

      </div>
    </Card>
  );
}
