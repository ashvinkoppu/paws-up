import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { SHOP_ITEMS, getCheaperAlternative } from '@/data/shopItems';
import { ShopItem, InventoryItem } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ShoppingCart, Package, AlertCircle, Lightbulb, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🛒' },
  { id: 'food', label: 'Food', icon: '🍖' },
  { id: 'toy', label: 'Toys', icon: '🎾' },
  { id: 'grooming', label: 'Grooming', icon: '✨' },
  { id: 'medicine', label: 'Medicine', icon: '💊' },
];

const Shop: React.FC = () => {
  const { state, spendMoney, addToInventory, useItem } = useGame();
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const handleBuy = (item: ShopItem) => {
    if (state.money < item.price) {
      const alternative = getCheaperAlternative(item);
      if (alternative) {
        toast({
          title: "Budget Tip",
          description: `Try ${alternative.name} for $${alternative.price} instead!`,
        });
      }
      return;
    }

    if (spendMoney(item.price, item.category, item.name)) {
      addToInventory(item as InventoryItem);
      toast({
        title: "Purchased!",
        description: `${item.name} added to inventory`,
      });
    }
  };

  const handleUseItem = (item: InventoryItem) => {
    useItem(item.id);
    toast({
      title: `Used ${item.name}!`,
      description: `Your pet enjoyed it!`,
    });
  };

  return (
    <Card className="h-full bg-card/80 border-2 border-border/50 shadow-lg rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif">Pet Shop</span>
          <Badge variant="outline" className="ml-auto font-mono bg-accent/50">
            ${state.money.toFixed(0)} available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-5 bg-accent/30 p-1 rounded-xl">
            <TabsTrigger
              value="shop"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shop</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="group flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm relative overflow-visible"
            >
              <div className="relative">
                <Package className="w-4 h-4 group-data-[state=active]:text-primary transition-colors" />
                {state.inventory.reduce((total, item) => total + item.quantity, 0) > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-md ring-2 ring-card animate-in zoom-in duration-300">
                    {state.inventory.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </div>
              <span>Inventory</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-4 mt-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
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
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, index) => {
                const canAfford = state.money >= item.price;
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
                      <span className={cn(
                        "font-mono font-bold text-lg",
                        canAfford ? "text-secondary" : "text-destructive"
                      )}>
                        ${item.price}
                      </span>
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
                        <span>Try {alternative.name} (${alternative.price})</span>
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

          <TabsContent value="inventory" className="space-y-3 mt-0">
            {state.inventory.length === 0 ? (
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
                {state.inventory.map((item, index) => (
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
