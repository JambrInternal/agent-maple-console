import React from 'react'


const BuildTag = () => {
    const commit = import.meta.env.VITE_GIT_COMMIT || 'dev';
    const [debugEnabled, setDebugEnabled] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {superAdmin && (
                <div style={{
                    background: '#ffb300',
                    color: '#222',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    padding: '2px 12px',
                    marginBottom: '6px',
                    fontSize: '12px',
                }}>
                    SUPER ADMIN MODE
                </div>
            )}
            {debugEnabled && (
                <div style={{
                    background: '#e53935',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    padding: '2px 12px',
                    marginBottom: '6px',
                    fontSize: '12px',
                }}>
                    DEBUG MODE
                </div>
            )}
            <span
                style={{
                    fontSize: '12px',
                    color: '#888',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                title="Build version"
                onClick={() => setDebugEnabled(true)}
            >
                Version {commit}
            </span>
        </div>
    );
}

export default BuildTag
