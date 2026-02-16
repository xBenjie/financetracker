import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    constructor() {
        this.supabase = createClient(environment.supabase.url, environment.supabase.key);
        this.currentUserSubject = new BehaviorSubject<User | null>(null);
        this.currentUser = this.currentUserSubject.asObservable();

        this.supabase.auth.getSession().then(({ data }) => {
            this.currentUserSubject.next(data.session?.user ?? null);
        });

        this.supabase.auth.onAuthStateChange((event, session) => {
            this.currentUserSubject.next(session?.user ?? null);
        });
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    async signUp(email: string, password: string) {
        return await this.supabase.auth.signUp({ email, password });
    }

    async signIn(email: string, password: string) {
        return await this.supabase.auth.signInWithPassword({ email, password });
    }

    async signOut() {
        return await this.supabase.auth.signOut();
    }

    // Transactions
    async getTransactions() {
        return await this.supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
    }

    async createTransaction(transaction: any) {
        return await this.supabase
            .from('transactions')
            .insert([transaction]);
    }

    async updateTransaction(id: number, transaction: any) {
        return await this.supabase
            .from('transactions')
            .update(transaction)
            .eq('id', id);
    }

    async deleteTransaction(id: number) {
        return await this.supabase
            .from('transactions')
            .delete()
            .eq('id', id);
    }

    // Budgets
    async getBudgets() {
        return await this.supabase
            .from('budgets')
            .select('*')
            .order('category', { ascending: true });
    }

    async createBudget(budget: any) {
        return await this.supabase
            .from('budgets')
            .insert([budget]);
    }

    async updateBudget(id: number, budget: any) {
        return await this.supabase
            .from('budgets')
            .update(budget)
            .eq('id', id);
    }

    async deleteBudget(id: number) {
        return await this.supabase
            .from('budgets')
            .delete()
            .eq('id', id);
    }

    // Goals
    async getGoals() {
        return await this.supabase
            .from('goals')
            .select('*')
            .order('deadline', { ascending: true });
    }

    async createGoal(goal: any) {
        return await this.supabase
            .from('goals')
            .insert([goal]);
    }

    async updateGoal(id: number, goal: any) {
        return await this.supabase
            .from('goals')
            .update(goal)
            .eq('id', id);
    }

    async deleteGoal(id: number) {
        return await this.supabase
            .from('goals')
            .delete()
            .eq('id', id);
    }
}
