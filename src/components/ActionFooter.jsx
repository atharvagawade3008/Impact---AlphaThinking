export function ActionFooter({ children, align = 'end', border = false, className = '' }) {
  return (
    <div className={`action-footer align-${align} ${border ? 'has-border' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default ActionFooter
