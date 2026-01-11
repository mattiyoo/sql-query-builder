'use client';

import { useState } from 'react';
import { Database, X, Check, AlertCircle } from 'lucide-react';
import type { DatabaseConnection } from '@/commons/models/database.model';

interface DatabaseConnectionProps {
    connection: DatabaseConnection;
    onConnectionChange: (connection: DatabaseConnection) => void;
}

export function DatabaseConnectionModal({ connection, onConnectionChange }: DatabaseConnectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [connectionType, setConnectionType] = useState<'default' | 'custom'>(connection.type);
    const [customConnectionString, setCustomConnectionString] = useState(connection.connectionString || '');
    const [customName, setCustomName] = useState(connection.name || '');
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState(false);

    const handleTestConnection = async () => {
        if (!customConnectionString) {
            setValidationError('Please enter a connection string');
            return;
        }

        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(false);

        try {
            const response = await fetch('/api/schema/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionString: customConnectionString }),
            });

            if (response.ok) {
                setValidationSuccess(true);
                setValidationError(null);
            } else {
                const data = await response.json();
                setValidationError(data.details || data.error || 'Connection failed');
                setValidationSuccess(false);
            }
        } catch (error) {
            setValidationError(error instanceof Error ? error.message : 'Connection failed');
            setValidationSuccess(false);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSave = () => {
        if (connectionType === 'default') {
            onConnectionChange({ type: 'default' });
            localStorage.setItem('dbConnection', JSON.stringify({ type: 'default' }));
        } else {
            if (!customConnectionString) {
                setValidationError('Please enter a connection string');
                return;
            }

            const newConnection: DatabaseConnection = {
                type: 'custom',
                connectionString: customConnectionString,
                name: customName || 'Custom Database',
            };

            onConnectionChange(newConnection);
            localStorage.setItem('dbConnection', JSON.stringify(newConnection));
        }

        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Database className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                    {connection.type === 'default' ? 'Default Database' : connection.name || 'Custom Database'}
                </span>
                <div className={`w-2 h-2 rounded-full ${connection.type === 'default' ? 'bg-green-500' : 'bg-blue-500'}`} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <Database className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Database Connection</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Connection Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setConnectionType('default')}
                                        className={`p-4 border-2 rounded-lg transition-all ${connectionType === 'default'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">Default Database</div>
                                        <div className="text-sm text-gray-500 mt-1">Use the built-in database</div>
                                    </button>
                                    <button
                                        onClick={() => setConnectionType('custom')}
                                        className={`p-4 border-2 rounded-lg transition-all ${connectionType === 'custom'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">Custom Connection</div>
                                        <div className="text-sm text-gray-500 mt-1">Connect to your database</div>
                                    </button>
                                </div>
                            </div>

                            {connectionType === 'custom' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Database Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            placeholder="My Database"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Connection String
                                        </label>
                                        <textarea
                                            value={customConnectionString}
                                            onChange={(e) => {
                                                setCustomConnectionString(e.target.value);
                                                setValidationError(null);
                                                setValidationSuccess(false);
                                            }}
                                            placeholder="postgresql://user:password@host:port/database"
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Example: postgresql://user:pass@host.com:5432/dbname?sslmode=require
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleTestConnection}
                                        disabled={isValidating || !customConnectionString}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {isValidating ? 'Testing Connection...' : 'Test Connection'}
                                    </button>

                                    {validationSuccess && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-700 font-medium">
                                                Connection successful!
                                            </span>
                                        </div>
                                    )}

                                    {validationError && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm text-red-700 font-medium">Connection failed</div>
                                                <div className="text-xs text-red-600 mt-1">{validationError}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                                Save Connection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
