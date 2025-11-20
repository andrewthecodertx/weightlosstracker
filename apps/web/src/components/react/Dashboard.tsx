import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    profile: {
        currentWeight: string | null;
        goalWeight: string | null;
        height: string | null;
        activityLevel: string | null;
        preferredUnits: string;
    };
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper function to convert inches to feet and inches
    const formatHeight = (inches: string | null) => {
        if (!inches) return null;
        const totalInches = parseInt(inches);
        const feet = Math.floor(totalInches / 12);
        const remainingInches = totalInches % 12;
        return `${feet}'${remainingInches}"`;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch (err: any) {
            setError('Failed to load user data');
            // If unauthorized, redirect to login
            if (err.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="card max-w-md">
                    <div className="text-red-600 mb-4">Error: {error}</div>
                    <button onClick={() => window.location.href = '/login'} className="btn bg-primary-600 text-white">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user.username}!</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Current Weight</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {user.profile.currentWeight ? `${parseFloat(user.profile.currentWeight).toFixed(1)} lbs` : 'Not set'}
                                </p>
                            </div>
                            <div className="text-4xl">⚖️</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Goal Weight</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {user.profile.goalWeight ? `${parseFloat(user.profile.goalWeight).toFixed(1)} lbs` : 'Not set'}
                                </p>
                            </div>
                            <div className="text-4xl">🎯</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Progress</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {user.profile.currentWeight && user.profile.goalWeight
                                        ? `${(parseFloat(user.profile.currentWeight) - parseFloat(user.profile.goalWeight)).toFixed(1)} lbs to go`
                                        : '--'}
                                </p>
                            </div>
                            <div className="text-4xl">📈</div>
                        </div>
                    </div>
                </div>
                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
                            <div className="text-center mb-4">
                                <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="rounded-full" />
                                    ) : (
                                        '👤'
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg">{user.username}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                {user.bio && (
                                    <div className="mb-3 text-center text-gray-700 italic">
                                        "{user.bio}"
                                    </div>
                                )}
                                {user.profile.height && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Height:</span>
                                        <span className="font-medium">{formatHeight(user.profile.height)}</span>
                                    </div>
                                )}
                                {user.profile.activityLevel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Activity:</span>
                                        <span className="font-medium capitalize">{user.profile.activityLevel.replace('_', ' ')}</span>
                                    </div>
                                )}
                            </div>
                            <button className="btn bg-primary-600 text-white w-full mt-4">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-5xl mb-3">📊</div>
                                <p>No recent activity</p>
                                <p className="text-sm mt-2">Start logging your weight to see your progress here</p>
                                <button className="btn bg-primary-600 text-white mt-4">
                                    Log Weight Entry
                                </button>
                            </div>
                        </div>
                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">👥</div>
                                    <div>
                                        <h3 className="font-semibold">Join a Team</h3>
                                        <p className="text-sm text-gray-600">Connect with others</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">🏆</div>
                                    <div>
                                        <h3 className="font-semibold">View Challenges</h3>
                                        <p className="text-sm text-gray-600">Compete and win</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
