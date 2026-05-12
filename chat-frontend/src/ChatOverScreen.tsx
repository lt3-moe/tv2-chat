import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";

export type COSHandle = {
    addLabel: (text: string, color: string) => void;
};

type FloatingLabel = {
    x: number; // the fuck is number? where is my int?
    y: number;
    width: number;
    height: number;
    fontSize: number;
    text: string;
    color: string; // why color needs to be a string? css?
};

const COS = forwardRef<COSHandle>((_, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const labelsRef = useRef<FloatingLabel[]>([]);
    function addLabel(text: string, color: string) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const fontSize = (Math.random() * 10) + 35;
        ctx.font = `${fontSize}px serif`;

        const metrics = ctx.measureText(text);
        const height =
            metrics.actualBoundingBoxAscent +
            metrics.actualBoundingBoxDescent;

        const y = Math.random() * canvas.height;

        const label: FloatingLabel = {
            x: canvas.width,
            y,
            width: metrics.width,
            height,
            fontSize,
            text,
            color,
        };

        labelsRef.current.push(label);
    }

    useImperativeHandle(ref, () => ({
        addLabel,
    }));
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let animationId: number;

        const speed = 2;

        function render() {
            
            ctx?.clearRect(0, 0, canvas.width, canvas.height);

            const labels = labelsRef.current;

            for (const label of labels) {
                label.x -= speed;
                // IT'S NOT NULL T_T
                ctx.font = `${label.fontSize}px serif`;
                ctx.fillStyle = label.color;
                ctx?.fillText(label.text, label.x, label.y);
                ctx?.
            }

            // remove off-screen labels
            labelsRef.current = labels.filter(
                (l) => l.x + l.width > 0
            );

            animationId = requestAnimationFrame(render);
        }

        render();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="COS_Canvas"
        />
    );
});

export default COS;