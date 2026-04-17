import { useState } from 'react'

interface EmailConnectProps {
  onConnect: (email: string, password: string, provider: string) => void
  onClose: () => void
}

export const EmailConnect = ({ onConnect, onClose }: EmailConnectProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [provider, setProvider] = useState('gmail')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onConnect(email, password, provider)
    } catch (err: any) {
      setError(err.message || 'Failed to connect email. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Connect Email Account</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="qq">QQ Mail</option>
              <option value="163">163 Mail</option>
              <option value="imap">Other (IMAP)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Note: For Gmail and QQ Mail, you may need to use an App Password or Authorization Code instead of your regular password.</p>
          <p className="mt-2">For QQ Mail:</p>
          <p>1. Go to QQ Mail settings and enable IMAP service</p>
          <p>2. Generate an authorization code in account security settings</p>
          <p>3. Use this authorization code instead of your QQ password</p>
        </div>
      </div>
    </div>
  )
}