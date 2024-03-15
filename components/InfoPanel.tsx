export function InfoPanel({ children }: { children: React.ReactElement }) {
    return (
        <div
            style={{
                borderLeft: '2px solid #0EA7E1',
                padding: '1rem',
                backgroundColor: '#0EA7E10D',
                borderRadius: '0 8px 8px 0'
            }}>
            {children}
        </div>
    )
}