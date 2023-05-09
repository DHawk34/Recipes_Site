using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Recipes_API.Models;

namespace Recipes_API.DATA;

public partial class RecipesSiteDbContext : DbContext
{
    public RecipesSiteDbContext(DbContextOptions<RecipesSiteDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<NationalCuisine> NationalCuisines { get; set; }

    public virtual DbSet<Recipe> Recipes { get; set; }

    public virtual DbSet<RecipeGroup> RecipeGroups { get; set; }

    public virtual DbSet<RecipeIngredient> RecipeIngredients { get; set; }

    public virtual DbSet<RecipeInstruction> RecipeInstructions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Image>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ContentType).HasColumnName("contentType");
            entity.Property(e => e.Data).HasColumnName("data");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_Ingredients_name").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<NationalCuisine>(entity =>
        {
            entity.ToTable("National_Cuisine");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CookTime).HasColumnName("cookTime");
            entity.Property(e => e.CreationTime).HasColumnName("creationTime");
            entity.Property(e => e.Difficult).HasColumnName("difficult");
            entity.Property(e => e.FinishImage).HasColumnName("finishImage");
            entity.Property(e => e.Group).HasColumnName("group");
            entity.Property(e => e.Hot).HasColumnName("hot");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.NationalCuisine).HasColumnName("nationalCuisine");
            entity.Property(e => e.PortionCount).HasColumnName("portionCount");

            entity.HasOne(d => d.FinishImageNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.FinishImage)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.GroupNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.Group)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.NationalCuisineNavigation).WithMany(p => p.Recipes).HasForeignKey(d => d.NationalCuisine);
        });

        modelBuilder.Entity<RecipeGroup>(entity =>
        {
            entity.ToTable("Recipe_Group");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Ingredient });

            entity.ToTable("Recipe-Ingredients");

            entity.Property(e => e.Recipe).HasColumnName("recipe");
            entity.Property(e => e.Ingredient).HasColumnName("ingredient");
            entity.Property(e => e.Amount).HasColumnName("amount");

            entity.HasOne(d => d.IngredientNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Ingredient)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeIngredients)
                .HasForeignKey(d => d.Recipe)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<RecipeInstruction>(entity =>
        {
            entity.HasKey(e => new { e.Recipe, e.Step });

            entity.ToTable("Recipe-Instructions");

            entity.Property(e => e.Recipe).HasColumnName("recipe");
            entity.Property(e => e.Step).HasColumnName("step");
            entity.Property(e => e.InstructionImage).HasColumnName("instructionImage");
            entity.Property(e => e.InstructionText).HasColumnName("instructionText");

            entity.HasOne(d => d.InstructionImageNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.InstructionImage)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.RecipeNavigation).WithMany(p => p.RecipeInstructions)
                .HasForeignKey(d => d.Recipe)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
