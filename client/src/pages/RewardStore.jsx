import React, { useState, useEffect } from 'react';
import {
  Coins, Palette, UserCircle, Zap, Gift, Check, ShoppingCart,
  Sparkles, Lock, Wand2, Crown, Star
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { purchaseItem, equipItem } from '../services/api';

// ── Store catalogue ──────────────────────────────────────────────────────────
const rewardsData = [
  {
    id: 'theme-default',
    title: 'Modern Light',
    category: 'Themes',
    cost: 0,
    description: 'The standard productive white theme — clean, calm, and professional.',
    icon: Palette,
    color: 'text-brand-600',
    bg: 'bg-white',
    preview: 'Clean white UI for maximum productivity.',
    equippable: true,
  },
  {
    id: 'theme-dark',
    title: 'Dark Mode',
    category: 'Themes',
    cost: 50,
    description: 'Unlock the sleek dark theme for a modern night-owl experience.',
    icon: Palette,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    preview: 'Dark UI, deep blacks & soft purples.',
    equippable: true,
  },
  {
    id: 'theme-neon',
    title: 'Neon Cyber',
    category: 'Themes',
    cost: 150,
    description: 'High-contrast cyberpunk neon colors pulse across your dashboard.',
    icon: Sparkles,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    preview: 'Electric neon on deep dark canvas.',
    equippable: true,
  },
  {
    id: 'avatar-ninja',
    title: 'Ninja Avatar',
    category: 'Avatars',
    cost: 100,
    description: 'Exclusive stealthy ninja profile frame — stealth mode activated.',
    icon: UserCircle,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    preview: '🥷 Ninja frame around your profile.',
    equippable: true,
  },
  {
    id: 'avatar-king',
    title: 'Royal Crown',
    category: 'Avatars',
    cost: 300,
    description: 'Wear the crown — show off your royalty status with a golden border.',
    icon: Crown,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    preview: '👑 Gold crown border on your avatar.',
    equippable: true,
  },
  {
    id: 'quiz-premium',
    title: 'Premium Quiz',
    category: 'Boosts',
    cost: 200,
    description: 'Unlock an exclusive high-XP premium quiz to level-up fast.',
    icon: Zap,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    preview: '🎯 Unlocks a bonus XP quiz in your path.',
    equippable: false,
  },
  {
    id: 'hint-pack',
    title: 'Hint Pack ×5',
    category: 'Boosts',
    cost: 75,
    description: 'Get 5 free hints usable on any difficult quiz question.',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    preview: '💡 +5 hints added to your account.',
    equippable: false,
  },
  {
    id: 'mystery-box',
    title: 'Mystery Box',
    category: 'Mystery',
    cost: 120,
    description: "Feeling lucky? Get a random premium reward unboxed instantly!",
    icon: Gift,
    color: 'text-brand-600',
    bg: 'bg-indigo-50',
    preview: '🎁 Could be any premium item!',
    equippable: false,
  },
];

// ── Theme applicator ─────────────────────────────────────────────────────────
const applyTheme = (themeId) => {
  const root = document.documentElement;
  if (themeId === 'theme-dark') {
    root.classList.add('theme-dark');
    root.classList.remove('theme-neon');
  } else if (themeId === 'theme-neon') {
    root.classList.add('theme-neon');
    root.classList.remove('theme-dark');
  } else {
    root.classList.remove('theme-dark', 'theme-neon');
  }
};

// ── Avatar decorator helper ──────────────────────────────────────────────────
export const getAvatarStyle = (avatarId) => {
  if (avatarId === 'avatar-ninja') return { border: '3px solid #6366F1', boxShadow: '0 0 0 4px rgba(99,102,241,0.25)' };
  if (avatarId === 'avatar-king')  return { border: '3px solid #EAB308', boxShadow: '0 0 0 4px rgba(234,179,8,0.30)' };
  return {};
};

export const getAvatarEmoji = (avatarId) => {
  if (avatarId === 'avatar-ninja') return '🥷';
  if (avatarId === 'avatar-king')  return '👑';
  return null;
};

// ── Component ────────────────────────────────────────────────────────────────
const RewardStore = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [isPurchasing, setIsPurchasing] = useState(null);
  const [isEquipping, setIsEquipping] = useState(null);

  const tabs = ['All', 'Themes', 'Avatars', 'Boosts', 'Mystery'];
  const coins = user?.coins ?? 0;
  const ownedItems = user?.ownedItems ?? [];
  const activeTheme = user?.activeTheme ?? null;
  const activeAvatar = user?.activeAvatar ?? null;
  const hints = user?.hints ?? 0;

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const handlePurchase = async (item) => {
    const isStackable = item.id === 'hint-pack';
    const isOwned = ownedItems.includes(item.id);

    if (isOwned && item.category !== 'Mystery' && !isStackable) {
      // Already owned equippable item — just equip it
      if (item.equippable) {
        handleEquip(item);
      } else {
        toast('You already own this item!', { icon: 'ℹ️' });
      }
      return;
    }

    if (coins < item.cost) {
      toast.error('Not enough coins!');
      return;
    }

    setIsPurchasing(item.id);
    try {
      const response = await purchaseItem({
        id: item.id,
        title: item.title,
        cost: item.cost,
        category: item.category,
      });

      if (response.data.success) {
        const d = response.data.data;
        updateUser({
          coins: d.coins,
          ownedItems: d.ownedItems,
          activeTheme: d.activeTheme,
          activeAvatar: d.activeAvatar,
          hints: d.hints,
        });

        // Apply theme immediately
        if (d.activeTheme) applyTheme(d.activeTheme);

        if (item.category === 'Mystery') {
          const wonId = response.data.wonItemId;
          const wonItem = rewardsData.find((r) => r.id === wonId);
          toast.success(`Mystery Box opened! You won: ${wonItem?.title || 'a secret reward'} 🎁`, { duration: 4000 });
        } else {
          toast.success(`${item.title} purchased & equipped! 🎉`);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Purchase failed';
      toast.error(msg);
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleEquip = async (item) => {
    if (!item.equippable) return;
    setIsEquipping(item.id);
    try {
      const res = await equipItem({ id: item.id });
      if (res.data.success) {
        const d = res.data.data;
        updateUser({ activeTheme: d.activeTheme, activeAvatar: d.activeAvatar });
        if (d.activeTheme) applyTheme(d.activeTheme);
        toast.success(`${item.title} equipped! ✨`);
      }
    } catch {
      toast.error('Failed to equip item');
    } finally {
      setIsEquipping(null);
    }
  };

  const filteredRewards =
    activeTab === 'All' ? rewardsData : rewardsData.filter((r) => r.category === activeTab);

  const isItemOwned = (itemId) => {
    if (itemId === 'theme-default') return true; // Default theme is always free/available
    return ownedItems.includes(itemId);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="pt-24 pb-8 px-4 sm:px-6 max-w-6xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-txt-primary flex items-center gap-3 tracking-tight mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <ShoppingCart className="text-white pt-0.5" size={20} strokeWidth={2.5} />
              </div>
              Reward <span className="text-brand-600">Store</span>
            </h1>
            <p className="text-txt-secondary text-sm font-medium ml-1">
              Spend your hard-earned coins on exclusive platform items.
            </p>
          </div>

          {/* Wallet & hints */}
          <div className="flex items-center gap-3 flex-wrap">
            {hints > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">Hints</p>
                  <p className="text-xl font-bold text-amber-700 leading-none">{hints}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 bg-white border border-surface-200 px-5 py-3 rounded-2xl shadow-sm hover:shadow-card-hover transition-shadow duration-300">
              <div className="bg-warning-50 p-2.5 rounded-xl border border-warning-100 flex items-center justify-center shadow-inner">
                <Coins className="text-warning-500 animate-pulse-soft" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-txt-tertiary font-bold uppercase tracking-wider mb-0.5">Your Balance</p>
                <p className="text-2xl font-bold text-txt-primary leading-none">{coins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active equips banner */}
        {(activeTheme || activeAvatar) && (
          <div className="mt-6 flex flex-wrap gap-3 animate-fade-in">
            {activeTheme && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl text-purple-700 text-sm font-semibold">
                <Wand2 size={15} />
                Active Theme: {rewardsData.find((r) => r.id === activeTheme)?.title || activeTheme}
              </div>
            )}
            {activeAvatar && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl text-yellow-700 text-sm font-semibold">
                <Crown size={15} />
                Active Avatar: {rewardsData.find((r) => r.id === activeAvatar)?.title || activeAvatar}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none animate-fade-in">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200
                ${activeTab === tab
                  ? 'bg-txt-primary text-white shadow-sm'
                  : 'bg-surface-50 text-txt-secondary hover:bg-surface-100 border border-surface-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 sm:px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
          {filteredRewards.map((reward) => {
            const isOwned = isItemOwned(reward.id);
            const isStackable = reward.id === 'hint-pack';
            const canAfford = coins >= reward.cost;
            const isActive =
              (reward.id === activeTheme) || 
              (reward.id === activeAvatar) ||
              (reward.id === 'theme-default' && activeTheme === null);
            const Icon = reward.icon;

            return (
              <div
                key={reward.id}
                className={`card group flex flex-col hover:-translate-y-1 p-5 relative transition-all duration-200
                  ${isActive ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}
              >
                {/* Active badge */}
                {isActive && (
                  <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Active
                  </span>
                )}

                {/* Lock icon for unaffordable */}
                {!canAfford && !isOwned && (
                  <div className="absolute top-3 right-3 p-1.5 bg-rose-50 text-rose-400 rounded-lg shadow-sm border border-rose-100" title="Not enough coins">
                    <Lock size={12} />
                  </div>
                )}

                <div className="flex justify-between items-start mb-5 pt-1">
                  <div className={`w-12 h-12 rounded-xl border border-surface-100 flex items-center justify-center shadow-sm ${reward.bg} ${reward.color}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-txt-secondary bg-surface-50 border border-surface-200 px-2 py-1 rounded-md">
                    {reward.category}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-txt-primary mb-1">{reward.title}</h3>
                  <p className="text-[13px] text-txt-secondary line-clamp-2 leading-relaxed font-medium">
                    {reward.description}
                  </p>
                  <p className="text-[11px] text-txt-tertiary mt-2 italic leading-snug">{reward.preview}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-1.5 font-bold text-base ${canAfford || isOwned ? 'text-warning-600' : 'text-txt-tertiary'}`}>
                      <Coins size={18} />
                      {reward.cost}
                    </div>
                    {isOwned && isStackable && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        Stackable
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Buy / Owned button */}
                    <button
                      onClick={() => handlePurchase(reward)}
                      disabled={
                        (isOwned && !isStackable && reward.category !== 'Mystery') ||
                        (!canAfford && !isOwned) ||
                        isPurchasing === reward.id
                      }
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all duration-200
                        ${isOwned && !isStackable && reward.category !== 'Mystery'
                          ? 'bg-success-50 text-success-700 border border-success-100 cursor-not-allowed'
                          : canAfford
                            ? 'bg-txt-primary text-white hover:bg-brand-600 shadow-sm cursor-pointer active:scale-[0.98]'
                            : 'bg-surface-100 text-txt-secondary cursor-not-allowed border border-surface-200'
                        }
                        ${isPurchasing === reward.id ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {isOwned && !isStackable && reward.category !== 'Mystery' ? (
                        <><Check size={14} strokeWidth={3} /> Owned</>
                      ) : isPurchasing === reward.id ? (
                        <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Buying</>
                      ) : isStackable && isOwned ? (
                        'Buy More'
                      ) : (
                        'Buy'
                      )}
                    </button>

                    {/* Equip button — only for owned equippable items that are not active */}
                    {isOwned && reward.equippable && !isActive && (
                      <button
                        onClick={() => handleEquip(reward)}
                        disabled={isEquipping === reward.id}
                        className="px-3 py-2 rounded-lg font-bold text-[13px] flex items-center gap-1 bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100 transition-all duration-200 active:scale-[0.97]"
                        title="Equip this item"
                      >
                        {isEquipping === reward.id ? (
                          <span className="w-3 h-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        Equip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="card-flat mt-5 text-center py-16 animate-fade-in max-w-lg mx-auto border-dashed">
            <div className="w-16 h-16 bg-white shadow-sm border border-surface-200 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Gift size={28} className="text-txt-tertiary" />
            </div>
            <p className="text-lg font-bold text-txt-primary mb-1">No items found</p>
            <p className="text-sm font-medium text-txt-secondary">We couldn't find any items in this category right now.</p>
          </div>
        )}
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #E5E7EB',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          },
        }}
      />
    </div>
  );
};

export default RewardStore;
