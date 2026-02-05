import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { SHOP_ITEMS, SHOP_CATEGORIES, getCheaperAlternative } from '@/data/shopItems';
import { ACCESSORY_CATALOG, getAccessoriesForGender, getAccessoryById } from '@/data/accessories';
import { ShopItem, InventoryItem, AccessorySlot, AccessoryDef } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ShoppingCart, Package, Lightbulb, Check, Crown, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


const SLOT_LABELS: Record<AccessorySlot, { label: string; icon: string }> = {
  head: { label: 'Head', icon: '🎩' },
  neck: { label: 'Neck', icon: '📿' },
  body: { label: 'Body', icon: '👔' },
  tag: { label: 'Tag', icon: '🏷️' },
};

const Shop: React.FC = () => {
  const { state, spendMoney, addToInventory, useItem, equipAccessory, unequipAccessory } = useGame();
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const discount = state.activeShopDiscount || 0;
  
  const getDiscountedPrice = (price: number) => {
    if (discount <= 0) return price;
    return Math.floor(price * (1 - discount / 100));
  };

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const petGender = state.pet?.gender || 'neutral';
  const ownedAccessoryIds = new Set(
    state.inventory
      .filter(item => item.id.startsWith('acc-'))
      .map(item => item.id)
  );
  const equippedAccessories = state.pet?.equippedAccessories || {};

  const availableAccessories = getAccessoriesForGender(petGender);

  const handleBuy = (item: ShopItem) => {
    const finalPrice = getDiscountedPrice(item.price);
    
    if (state.money < finalPrice) {
      const alternative = getCheaperAlternative(item);
      if (alternative) {
        toast({
          title: "Budget Tip",
          description: `Try ${alternative.name} for $${alternative.price} instead!`,
        });
      }
      return;
    }

    if (spendMoney(finalPrice, item.category, item.name)) {
      addToInventory({ ...item, quantity: 1 });
      toast({
        title: "Purchased!",
        description: `${item.name} added to inventory${discount > 0 ? ` (${discount}% off!)` : ''}`,
      });
    }
  };

  const handleBuyAccessory = (accessory: AccessoryDef) => {
    const finalPrice = getDiscountedPrice(accessory.price);
    
    if (state.money < finalPrice) return;

    if (spendMoney(finalPrice, 'accessory', accessory.name)) {
      // Add to inventory with quantity tracking
      const inventoryItem: InventoryItem = {
        id: accessory.id,
        name: accessory.name,
        description: accessory.description,
        price: accessory.price,
        category: 'accessory',
        tier: accessory.tier,
        effects: { happiness: 5 },
        icon: accessory.emoji,
        quantity: 1,
      };
      addToInventory(inventoryItem);
      toast({
        title: "Purchased!",
        description: `${accessory.emoji} ${accessory.name} added to your wardrobe${discount > 0 ? ` (${discount}% off!)` : ''}`,
      });
    }
  };

  const handleEquip = (accessory: AccessoryDef) => {
    equipAccessory(accessory.slot, accessory.id);
    toast({
      title: `${accessory.emoji} Equipped!`,
      description: `${accessory.name} is now on your pet`,
    });
  };

  const handleUnequip = (slot: AccessorySlot) => {
    const accessoryId = equippedAccessories[slot];
    const accessory = accessoryId ? getAccessoryById(accessoryId) : null;
    unequipAccessory(slot);
    toast({
      title: "Unequipped",
      description: accessory ? `Removed ${accessory.name}` : `Removed ${slot} accessory`,
    });
  };

  const handleUseItem = (item: InventoryItem) => {
    useItem(item.id);
    toast({
      title: `Used ${item.name}!`,
      description: `Your pet enjoyed it!`,
    });
  };

  // Filter non-accessory inventory items for the inventory tab
  const consumableInventory = state.inventory.filter(item => !item.id.startsWith('acc-'));

  return (
    <Card className="h-full glass-card shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif">Pet Shop</span>
          <Badge variant="outline" className="ml-auto font-mono bg-accent/50">
            ${state.money.toFixed(0)} available
          </Badge>
          {discount > 0 && (
            <Badge className="bg-emerald-500 text-white animate-pulse">
              {discount}% OFF ACTIVE!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-5 bg-accent/20 backdrop-blur-sm p-1 rounded-xl border border-border/20">
            <TabsTrigger
              value="shop"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shop</span>
            </TabsTrigger>
            <TabsTrigger
              value="wardrobe"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Crown className="w-4 h-4" />
              <span>Wardrobe</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="group flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm relative overflow-visible"
            >
              <div className="relative">
                <Package className="w-4 h-4 group-data-[state=active]:text-primary transition-colors" />
                {consumableInventory.reduce((total, item) => total + item.quantity, 0) > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-md ring-2 ring-card animate-in zoom-in duration-300">
                    {consumableInventory.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </div>
              <span>Items</span>
            </TabsTrigger>
          </TabsList>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-4 mt-0 max-h-[650px] overflow-y-auto pr-1">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {SHOP_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-full border-2 transition-all duration-200",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 hover:border-primary/50"
                  )}
                  title={category.description}
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, index) => {
                const finalPrice = getDiscountedPrice(item.price);
                const canAfford = state.money >= finalPrice;
                const alternative = !canAfford ? getCheaperAlternative(item) : null;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300",
                      "animate-fade-in-up opacity-0",
                      canAfford
                        ? "bg-card hover:border-primary/40 hover:shadow-md card-hover"
                        : "bg-muted/20 border-dashed border-border/50"
                    )}
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2 bg-accent/50 rounded-xl">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs capitalize mt-1",
                              item.tier === 'deluxe' ? "border-primary/50 text-primary" :
                              item.tier === 'standard' ? "border-secondary/50 text-secondary" :
                              "border-border text-muted-foreground"
                            )}
                          >
                            {item.tier}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {discount > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${item.price}
                          </span>
                        )}
                        <span className={cn(
                          "font-mono font-bold text-lg",
                          canAfford ? "text-secondary" : "text-destructive",
                          discount > 0 && "text-emerald-500"
                        )}>
                          ${finalPrice}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {Object.entries(item.effects).map(([stat, value]) => (
                        <Badge
                          key={stat}
                          className={cn(
                            "text-xs font-medium",
                            value! > 0 ? "bg-secondary/15 text-secondary border-secondary/30" : "bg-destructive/15 text-destructive"
                          )}
                        >
                          {value! > 0 ? '+' : ''}{value} {stat}
                        </Badge>
                      ))}
                    </div>

                    {!canAfford && alternative && (
                      <div className="flex items-center gap-1.5 text-xs text-chart-1 mb-3 p-2 bg-chart-1/10 rounded-lg">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Try {alternative.name} (${getDiscountedPrice(alternative.price)})</span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className={cn(
                        "w-full rounded-lg transition-all duration-200",
                        canAfford
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Purchase' : 'Insufficient funds'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Wardrobe Tab - Equippable Accessories */}
          <TabsContent value="wardrobe" className="space-y-4 mt-0 max-h-[650px] overflow-y-auto pr-1">
            {/* Currently equipped */}
            <div className="p-4 rounded-xl border-2 border-border/50 bg-accent/20">
              <h4 className="font-serif font-semibold text-sm text-foreground mb-3">Currently Wearing</h4>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SLOT_LABELS) as AccessorySlot[]).map((slot) => {
                  const equippedId = equippedAccessories[slot];
                  const accessory = equippedId ? getAccessoryById(equippedId) : null;
                  return (
                    <div
                      key={slot}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all duration-200",
                        accessory ? "border-secondary/30 bg-secondary/5" : "border-dashed border-border/50 bg-muted/10"
                      )}
                    >
                      <span className="text-lg">{accessory ? accessory.emoji : SLOT_LABELS[slot].icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground">{SLOT_LABELS[slot].label}</div>
                        <div className="text-xs font-semibold text-foreground truncate">
                          {accessory ? accessory.name : 'Empty'}
                        </div>
                      </div>
                      {accessory && (
                        <button
                          onClick={() => handleUnequip(slot)}
                          className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accessory shop */}
            <h4 className="font-serif font-semibold text-sm text-foreground">
              {petGender === 'neutral' ? 'All Accessories' : `${petGender === 'male' ? '♂' : '♀'} ${petGender.charAt(0).toUpperCase() + petGender.slice(1)} Accessories`}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableAccessories.map((accessory, index) => {
                const owned = ownedAccessoryIds.has(accessory.id);
                const isEquipped = Object.values(equippedAccessories).includes(accessory.id);
                const finalPrice = getDiscountedPrice(accessory.price);
                const canAfford = state.money >= finalPrice;
                const slotInfo = SLOT_LABELS[accessory.slot];

                return (
                  <div
                    key={accessory.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300",
                      "animate-fade-in-up opacity-0",
                      isEquipped
                        ? "border-secondary bg-secondary/5"
                        : owned
                        ? "border-border/50 bg-card hover:border-primary/40"
                        : canAfford
                        ? "bg-card hover:border-primary/40 hover:shadow-md card-hover"
                        : "bg-muted/20 border-dashed border-border/50"
                    )}
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2 bg-accent/50 rounded-xl">
                          {accessory.emoji}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{accessory.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {slotInfo.icon} {slotInfo.label}
                            </Badge>
                            {accessory.condition && (
                              <Badge variant="outline" className="text-xs border-chart-1/50 text-chart-1">
                                {accessory.condition.stat} &ge; {accessory.condition.min}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!owned && (
                        <div className="flex flex-col items-end">
                          {discount > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${accessory.price}
                            </span>
                          )}
                          <span className={cn(
                            "font-mono font-bold text-lg",
                            canAfford ? "text-secondary" : "text-destructive",
                            discount > 0 && "text-emerald-500"
                          )}>
                            ${finalPrice}
                          </span>
                        </div>
                      )}
                      {owned && !isEquipped && (
                        <Badge className="bg-accent text-accent-foreground">Owned</Badge>
                      )}
                      {isEquipped && (
                        <Badge className="bg-secondary/20 text-secondary">Wearing</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {accessory.description}
                    </p>

                    {!owned ? (
                      <Button
                        size="sm"
                        className={cn(
                          "w-full rounded-lg transition-all duration-200",
                          canAfford ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                        onClick={() => handleBuyAccessory(accessory)}
                        disabled={!canAfford}
                      >
                        {canAfford ? 'Purchase' : 'Insufficient funds'}
                      </Button>
                    ) : isEquipped ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleUnequip(accessory.slot)}
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        Unequip
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full rounded-lg bg-secondary hover:bg-secondary/90"
                        onClick={() => handleEquip(accessory)}
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Equip
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Inventory Tab - Consumable Items */}
          <TabsContent value="inventory" className="space-y-3 mt-0 max-h-[650px] overflow-y-auto pr-1">
            {consumableInventory.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex p-4 bg-accent/30 rounded-full mb-4">
                  <Package className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <p className="font-semibold text-foreground mb-1">Inventory Empty</p>
                <p className="text-sm text-muted-foreground">
                  Purchase items from the shop to care for your pet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {consumableInventory.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-xl border-2 border-border/50 bg-card",
                      "hover:shadow-md transition-all duration-300 card-hover",
                      "animate-fade-in-up opacity-0"
                    )}
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2 bg-accent/50 rounded-xl">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            Quantity: <span className="font-mono font-semibold text-foreground">{item.quantity}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {Object.entries(item.effects).map(([stat, value]) => (
                        <Badge
                          key={stat}
                          className="text-xs bg-secondary/15 text-secondary border-secondary/30"
                        >
                          {value! > 0 ? '+' : ''}{value} {stat}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      className="w-full rounded-lg bg-secondary hover:bg-secondary/90"
                      onClick={() => handleUseItem(item)}
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Use Item
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Shop;
