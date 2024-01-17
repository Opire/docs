export function DimmedText({ children }: { children: React.ReactElement }) {
    return (
        <span style={{ color: 'grey' }}>{children}</span>
    )
}